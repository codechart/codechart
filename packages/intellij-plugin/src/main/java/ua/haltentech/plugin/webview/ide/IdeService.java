package ua.haltentech.plugin.webview.ide;

import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.components.Service;
import com.intellij.openapi.editor.Document;
import com.intellij.openapi.editor.Editor;
import com.intellij.openapi.editor.markup.HighlighterLayer;
import com.intellij.openapi.editor.markup.RangeHighlighter;
import com.intellij.openapi.editor.markup.TextAttributes;
import com.intellij.openapi.fileEditor.FileEditor;
import com.intellij.openapi.fileEditor.FileEditorManager;
import com.intellij.openapi.fileEditor.OpenFileDescriptor;
import com.intellij.openapi.fileEditor.TextEditor;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.vfs.LocalFileSystem;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.psi.PsiFile;
import com.intellij.psi.PsiManager;
import org.jetbrains.annotations.Nullable;

import java.awt.*;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Objects;

import static ua.haltentech.plugin.webview.Constants.WEBVIEW_MD_NAME;
import static ua.haltentech.plugin.webview.Util.showError;

@Service(Service.Level.PROJECT)
public final class IdeService {
    private final Project project;
    private RangeHighlighter highlighter;


    public IdeService(Project project) {
        this.project = project;
    }

    public String getFileContent(VirtualFile virtualFile) {
        PsiFile psiFile = PsiManager.getInstance(project).findFile(virtualFile);

        if (psiFile != null) {
            return psiFile.getText();
        }

        return "";
    }

    public void openWebviewMdInEditor(String content) {
        try {
            Path path = Path.of(Objects.requireNonNull(project.getBasePath()), WEBVIEW_MD_NAME);

            if (!Files.exists(path)) {
                Files.write(path, content.getBytes());
            }

            ApplicationManager.getApplication().invokeLater(() -> {
                VirtualFile virtualFile = LocalFileSystem.getInstance().refreshAndFindFileByIoFile(path.toFile());

                if (virtualFile == null) {
                    showError(project, "Can't find " + WEBVIEW_MD_NAME);

                    return;
                }

                FileEditor[] fileEditors = FileEditorManager.getInstance(project).openFile(virtualFile, true);

                if (fileEditors != null && fileEditors.length > 0) {
                    Editor editor = ((TextEditor) FileEditorManager.getInstance(project).openFile(virtualFile, true)[0]).getEditor();

                    Document document = editor.getDocument();

                    if (document == null) {
                        return;
                    }

                    ApplicationManager.getApplication().runWriteAction(() -> document.setText(content));
                }
            });
        } catch (Exception e) {
            showError(project, e.getMessage());
        }
    }


    /**
     * @param lineNumber zero-based, as sent by the viewer (goToLineInIde_webviewEvent).
     */
    public void openFileOnLine(String projectPath, String filePath, int lineNumber) {
        String normalizedProjectPath = Paths.get(projectPath).normalize().toString();
        String currentProjectPath = Paths.get(project.getBasePath()).normalize().toString();
        Path normalizedFilePath = Paths.get(filePath).normalize();

        // this will not work if diagram was created in different folder, relative to .git folder, than what is used by IJ
        if (!normalizedProjectPath.equals(currentProjectPath)) {
            showError(project, "Project paths do not match. IJ path" + normalizedProjectPath + "\n Cochart project path" + currentProjectPath);
            return;
        }

        // The viewer sends an absolute path when the diagram declares a base path, and a
        // project-relative one otherwise. Resolving an absolute path against the project
        // root would produce garbage, so only join when it is actually relative.
        Path resolvedPath = normalizedFilePath.isAbsolute()
                ? normalizedFilePath
                : Paths.get(normalizedProjectPath).resolve(normalizedFilePath);

        File targetFile = resolvedPath.toFile();
        VirtualFile virtualFile = LocalFileSystem.getInstance().refreshAndFindFileByIoFile(targetFile);

        if (virtualFile == null) {
            showError(project, "virtual file not found: " + resolvedPath);
            return;
        }

        ApplicationManager.getApplication().invokeLater(() -> {
            try {
                // OpenFileDescriptor takes a zero-based logical line - pass it through as-is.
                int targetLine = Math.max(0, lineNumber);

                Editor editor = FileEditorManager.getInstance(project)
                        .openTextEditor(new OpenFileDescriptor(project, virtualFile, targetLine, 0), true);

                if (editor != null) {
                    highlightLine(editor, targetLine);
                }
            } catch (Exception ex) {
                showError(project, ex.getMessage());
            }
        });
    }

    private void highlightLine(Editor editor, int lineNumber) {
        if (highlighter != null) {
            highlighter.dispose();
        }

        int lastLine = Math.max(0, editor.getDocument().getLineCount() - 1);
        int safeLine = Math.min(Math.max(0, lineNumber), lastLine);

        TextAttributes attributes = new TextAttributes();
        attributes.setBackgroundColor(new Color(255, 255, 224));

        // addLineHighlighter is zero-based, same as OpenFileDescriptor.
        highlighter = editor.getMarkupModel().addLineHighlighter(safeLine, HighlighterLayer.SELECTION, attributes);
    }
}
