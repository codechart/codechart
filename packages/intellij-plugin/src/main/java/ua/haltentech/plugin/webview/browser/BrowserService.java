package ua.haltentech.plugin.webview.browser;

import com.intellij.openapi.Disposable;
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
import com.intellij.openapi.util.Disposer;
import com.intellij.openapi.vfs.LocalFileSystem;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.ui.jcef.JBCefApp;
import com.intellij.ui.jcef.JBCefBrowser;
import com.intellij.ui.jcef.JBCefBrowserBase;
import com.intellij.ui.jcef.JBCefClient;
import com.intellij.ui.jcef.JBCefJSQuery;
import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.handler.CefLoadHandlerAdapter;
import org.jetbrains.annotations.NotNull;
import ua.haltentech.plugin.webview.ide.IdeService;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static ua.haltentech.plugin.webview.Constants.WEBVIEW_MD_NAME;
import static ua.haltentech.plugin.webview.Util.isNumber;
import static ua.haltentech.plugin.webview.Util.showError;

@Service(Service.Level.PROJECT)
public final class BrowserService implements Disposable {
    /** Synthetic origin used for the plugin's bundled webview assets. */
    public static final String PLUGIN_ORIGIN = "http://plugin";

    public static final String JCEF_UNAVAILABLE_MESSAGE =
            "Cochart cannot start: the embedded browser (JCEF) is not available in this IDE runtime. "
                    + "Switch the IDE to a JetBrains Runtime with JCEF support "
                    + "(Help | Find Action | Choose Boot Java Runtime for the IDE) and restart.";

    private final Project project;
    private final JBCefBrowser browser;

    /** JS snippets that re-install the IDE bridge into the page; built once, replayed on every load. */
    private final List<String> bridgeInjections = new ArrayList<>();

    private boolean bridgeRegistered = false;

    public BrowserService(Project project) {
        this.project = project;

        if (!JBCefApp.isSupported()) {
            // No silent fallback: tell the user, then fail loudly.
            showError(project, JCEF_UNAVAILABLE_MESSAGE);

            throw new IllegalStateException(JCEF_UNAVAILABLE_MESSAGE);
        }

        this.browser = new JBCefBrowser();

        Disposer.register(this, browser);

        JBCefClient client = browser.getJBCefClient();

        client.setProperty(JBCefClient.Properties.JS_QUERY_POOL_SIZE, 100);

        // Serve http://plugin/* from the plugin jar, scoped to this browser only.
        client.addRequestHandler(new LocalResourceRequestHandler(PLUGIN_ORIGIN), browser.getCefBrowser());

        // Real readiness signal instead of a fixed sleep: inject the bridge once the page has loaded.
        client.addLoadHandler(new CefLoadHandlerAdapter() {
            @Override
            public void onLoadEnd(CefBrowser cefBrowser, CefFrame frame, int httpStatusCode) {
                if (frame != null && !frame.isMain()) {
                    return;
                }

                init();
            }
        }, browser.getCefBrowser());
    }

    @Override
    public void dispose() {
        // Children registered with Disposer (the browser) are disposed automatically.
    }

    public void loadWebview() {
        browser.loadURL(PLUGIN_ORIGIN + "/ij-plugin.html");
    }

    /**
     * Installs the JS -> IDE bridge into the currently loaded page. The Java-side query handlers are
     * created exactly once; only the JS shims are re-injected, because a page load wipes them.
     */
    public void init() {
        ApplicationManager.getApplication().invokeLater(() -> {
            if (!bridgeRegistered) {
                bridgeRegistered = true;

                bridgeInjections.add(registerIsRunningInIdeCallback());
                bridgeInjections.add(registerDisplayReadmeInIdeCallback());
                bridgeInjections.add(registerGoToLineIdeCallback());
                bridgeInjections.add(registerGetProjectPathCallback());

                setupWebviewMdEditorListener();
            }

            String url = browser.getCefBrowser().getURL();

            for (String injection : bridgeInjections) {
                browser.getCefBrowser().executeJavaScript(injection, url, 0);
            }
        });
    }

    public JBCefBrowser getBrowser() {
        return browser;
    }

    public void executeDisplayInputInReadmeElementFunction(String text) {
        browser.getCefBrowser().executeJavaScript(String.format("displayInputInReadmeElement('%s')", text), "", 0);
    }

    public void executeGetProjectPathFunction() {
        String projectPath = project.getBasePath();

        if (projectPath == null) {
            projectPath = "";
        }

        String function = String.format(
                "frameElement.contentWindow.postMessage({action: 'setProjectPath_ideEvent', data: {projectPath: '%s'}}, '*')",
                projectPath.replace("'", "\\'"));

        browser.getCefBrowser().executeJavaScript(function, "", 0);
    }

    private String escapeMetaCharacters(String inputString) {
        return inputString
                .replace("'", "\"")
                .replace("\n", " \\n ");
    }

    private String registerGoToLineIdeCallback() {
        JBCefJSQuery jsQuery = JBCefJSQuery.create((JBCefBrowserBase) browser);

        jsQuery.addHandler((result) -> {
            try {
                if (result.isEmpty()) {
                    return null;
                }

                String[] goToDetails = result.split("#");
                String projectPath = goToDetails[0];
                String filePath = Paths.get(goToDetails[1]).normalize() + "";
                String lineNumberStr;

                if (goToDetails.length > 2) {
                    lineNumberStr = goToDetails[2];
                } else {
                    lineNumberStr = "";
                }

                int goToLineNumber = 0;

                if (isNumber(lineNumberStr)) {
                    // The viewer already sends a zero-based line (startLine - 1), so pass it
                    // straight through. The old Angular UI sent one-based lines, which is why
                    // this used to subtract 1.
                    goToLineNumber = Integer.parseInt(lineNumberStr);
                }

                project.getService(IdeService.class).openFileOnLine(projectPath, filePath, goToLineNumber);
            } catch (Exception ex) {
                showError(project, "Java exception: " + ex.getMessage());
            }

            return null;
        });

        return "window.goToLineInIDE = function(projectPath, filePath, lineNumber) {"
                + "try {"
                + "var goToPath = projectPath + \"#\" + filePath + \"#\" + lineNumber;"
                + jsQuery.inject("goToPath")
                + ";"
                + "} catch(ex) {alert(ex)}"
                + "}";
    }

    private String registerIsRunningInIdeCallback() {
        JBCefJSQuery jsQuery = JBCefJSQuery.create((JBCefBrowserBase) browser);

        jsQuery.addHandler((result) -> new JBCefJSQuery.Response("IntelliJ Ide"));

        return "window.isInIntellijCallback = function(param) {"
                + "try {"
                + jsQuery.inject("param")
                + ";"
                + "return true;"
                + "} catch(ex) {alert(ex)}"
                + "}";
    }

    private String registerDisplayReadmeInIdeCallback() {
        JBCefJSQuery jsQuery = JBCefJSQuery.create((JBCefBrowserBase) browser);

        jsQuery.addHandler((webviewMdContent) -> {
            project.getService(IdeService.class).openWebviewMdInEditor(webviewMdContent);

            return null;
        });

        return "window.displayReadmeInIde = function(htmlReadmeText) {"
                + "try {"
                + jsQuery.inject("htmlReadmeText")
                + ";"
                + "} catch(ex) {alert(ex)}"
                + "}";
    }

    private String registerGetProjectPathCallback() {
        JBCefJSQuery jsQuery = JBCefJSQuery.create((JBCefBrowserBase) browser);

        jsQuery.addHandler((result) -> {
            executeGetProjectPathFunction();

            return null;
        });

        return "window.getProjectPathideEventCallback = function() {"
                + "try {"
                + jsQuery.inject("'getProjectPath'")
                + ";"
                + "} catch(ex) {alert(ex)}"
                + "}";
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

                FileEditor[] fileEditors = FileEditorManager.getInstance(project).openFile(virtualFile, false);

                for (FileEditor fileEditor : fileEditors) {
                    if (!(fileEditor instanceof TextEditor)) {
                        continue;
                    }

                    Editor editor = ((TextEditor) fileEditor).getEditor();

                    Document document = editor.getDocument();

                    document.addDocumentListener(new DocumentListener() {
                        @Override
                        public void documentChanged(@NotNull DocumentEvent event) {
                            DocumentListener.super.documentChanged(event);

                            executeDisplayInputInReadmeElementFunction(
                                    escapeMetaCharacters(event.getDocument().getText()));
                        }
                    }, this);
                }

                FileEditorManager.getInstance(project).closeFile(virtualFile);
            });
        } catch (Exception e) {
            showError(project, e.getMessage());
        }
    }
}
