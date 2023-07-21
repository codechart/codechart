package ua.haltentech.plugin.webview.browser;

import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.components.Service;
import com.intellij.openapi.editor.Document;
import com.intellij.openapi.editor.Editor;
import com.intellij.openapi.editor.event.DocumentEvent;
import com.intellij.openapi.editor.event.DocumentListener;
import com.intellij.openapi.fileEditor.FileEditor;
import com.intellij.openapi.fileEditor.FileEditorManager;
import com.intellij.openapi.fileEditor.TextEditor;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.vfs.LocalFileSystem;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.openapi.vfs.VirtualFileManager;
import com.intellij.openapi.vfs.newvfs.BulkFileListener;
import com.intellij.openapi.vfs.newvfs.events.VFileEvent;
import com.intellij.ui.jcef.JBCefBrowser;
import com.intellij.ui.jcef.JBCefBrowserBase;
import com.intellij.ui.jcef.JBCefClient;
import com.intellij.ui.jcef.JBCefJSQuery;
import com.intellij.util.messages.MessageBusConnection;
import org.jetbrains.annotations.NotNull;
import ua.haltentech.plugin.webview.ide.IdeService;
import java.nio.file.*;
import java.util.List;
import java.util.Objects;

import static ua.haltentech.plugin.webview.Constants.WEBVIEW_MD_NAME;
import static ua.haltentech.plugin.webview.Util.isNumber;
import static ua.haltentech.plugin.webview.Util.showError;

@Service
public final class BrowserService {
    private final JBCefBrowser browser = new JBCefBrowser();

    private final Project project;

    public BrowserService(Project project) {
        this.project = project;

        browser.getJBCefClient().setProperty(JBCefClient.Properties.JS_QUERY_POOL_SIZE, 10);
    }

    public void init() {
        ApplicationManager.getApplication().invokeLater(this::setupDisplayReadmeInIdeCallback);
        ApplicationManager.getApplication().invokeLater(this::setupGoToLineIdeCallback);
        ApplicationManager.getApplication().invokeLater(this::setupWebviewMdEditorListener);
    }

    public JBCefBrowser getBrowser() {
        return browser;
    }

    public void executeClickedOnLineFunction(JsFunctionParameters parameters) {
        String function = buildClickedOnLineFunction(parameters);

        this.runInBrowser(function, "", 0);
    }

    public void executeClickedOnFileFunction(JsFunctionParameters parameters) {
        String function = buildClickedOnFileFunction(parameters);

        this.runInBrowser(function, "", 0);
    }

    public void executeDisplayInputInReadmeElementFunction(String text) {
        String jsFunction = String.format("displayInputInReadmeElement('%s')", text);
        this.runInBrowser(jsFunction, "", 0);
    }

    private String escapeMetaCharacters(String inputString) {
        return inputString
                .replace("'", "\"")
                .replace("\n", " \\n ");
    }

    private String buildClickedOnFileFunction(JsFunctionParameters parameters) {
        return String.format("clickedOnFile('%s', '%s', '%s', '%s', '%s')",
                parameters.getIdeEventObject(),
                parameters.getFilePath(),
                parameters.getProjectPath(),
                "",
                String.join(", ", parameters.getFolderFiles()));
    }

    private String buildClickedOnLineFunction(JsFunctionParameters parameters) {
        return String.format("clickedOnLine('%s', '%s', '%s', '%s', '%s', '%s')",
                parameters.getIdeEventObject(),
                "",
                parameters.getLineNumber() + 1,
                parameters.getFilePath(),
                parameters.getProjectPath(),
                "");
    }

    private void setupGoToLineIdeCallback() {
        JBCefJSQuery jsQuery  = JBCefJSQuery.create((JBCefBrowserBase) browser);

        jsQuery.addHandler((result) -> {
            try {
                if (result.isEmpty()) {
                    return null;
                }

                String[] goToDetails = result.split("#");
                String filePath = Paths.get(goToDetails[0]).normalize()+"";
                String lineNumberStr;

                if (goToDetails.length > 1) {
                    lineNumberStr = goToDetails[1];
                } else {
                    lineNumberStr = "";
                }

                int goToLineNumber = 0;

                if (isNumber(lineNumberStr)) {
                    goToLineNumber = Integer.parseInt(lineNumberStr) - 1;
                }

                project.getService(IdeService.class).openFileOnLine(filePath, goToLineNumber);
            } catch (Exception ex) {
                showError(project, "Java exception: " + ex.getMessage());
            }

            return null;
        });

        String injectedJavaScript = "window.goToLineInIDE = function(filePath, lineNumber) {"
                + "try {"
                + "var goToPath = filePath + \"#\" + lineNumber;"
                + jsQuery.inject("goToPath")
                + ";"
                + "} catch(ex) {alert(ex)}"
                + "}";

        runInBrowser(injectedJavaScript, browser.getCefBrowser().getURL(), 0);
    }

    private void runInBrowser(String injectedJavaScript, String url, int line) {
        System.out.print(injectedJavaScript);
        browser.getCefBrowser().executeJavaScript(injectedJavaScript, url, line);
    }


    private void setupDisplayReadmeInIdeCallback() {
        JBCefJSQuery jsQuery  = JBCefJSQuery.create((JBCefBrowserBase) browser);

        jsQuery.addHandler((webviewMdContent) -> {
            project.getService(IdeService.class).openWebviewMdInEditor(webviewMdContent);

            return null;
        });

        String injectedJavaScript = "window.displayReadmeInIde = function(htmlReadmeText) {"
                + "try {"
                + jsQuery.inject("htmlReadmeText")
                + ";"
                + "} catch(ex) {alert(ex)}"
                + "}";

        runInBrowser(injectedJavaScript, browser.getCefBrowser().getURL(), 0);
    }

    private void setupWebviewMdEditorListener() {
        try {
            Path path = Path.of(Objects.requireNonNull(project.getBasePath()), WEBVIEW_MD_NAME);

            if (!Files.exists(path)) {
                Files.write(path, "".getBytes());
            }

            ApplicationManager.getApplication().invokeLater(() -> {
                VirtualFile virtualFile = LocalFileSystem.getInstance().refreshAndFindFileByIoFile(path.toFile());

                if (virtualFile == null) {
                    showError(project, "Can't find " + WEBVIEW_MD_NAME);

                    return;
                }

                FileEditor[] fileEditors = FileEditorManager.getInstance(project).openFile(virtualFile, true);

                for (FileEditor fileEditor : fileEditors) {
                    Editor editor = ((TextEditor) fileEditor).getEditor();

                    Document document = editor.getDocument();

                    document.addDocumentListener(new DocumentListener() {
                        @Override
                        public void documentChanged(@NotNull DocumentEvent event) {
                            DocumentListener.super.documentChanged(event);

                            executeDisplayInputInReadmeElementFunction(escapeMetaCharacters(event.getDocument().getText()));
                        }
                    });
                }
            });
        } catch (Exception e) {
            showError(project, e.getMessage());
        }
    }
}
