package ua.haltentech.plugin.webview.ide;

import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.components.Service;
import com.intellij.openapi.editor.Document;
import com.intellij.openapi.editor.Editor;
import com.intellij.openapi.fileEditor.FileEditor;
import com.intellij.openapi.fileEditor.FileEditorManager;
import com.intellij.openapi.fileEditor.OpenFileDescriptor;
import com.intellij.openapi.fileEditor.TextEditor;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.vfs.LocalFileSystem;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.psi.PsiFile;
import com.intellij.psi.PsiManager;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Objects;

import static ua.haltentech.plugin.webview.Constants.WEBVIEW_MD_NAME;
import static ua.haltentech.plugin.webview.Util.showError;

@Service
public final class IdeService {
    private final Project project;

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
                    Editor editor = ((TextEditor)FileEditorManager.getInstance(project).openFile(virtualFile, true)[0]).getEditor();

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

    public void openFileOnLine(String filePath, int lineNumber) {
        VirtualFile virtualFile = LocalFileSystem.getInstance().findFileByPath(filePath);

        if (virtualFile == null) {
            return;
        }

        ApplicationManager.getApplication().invokeLater(() -> FileEditorManager.getInstance(project)
                .openTextEditor(new OpenFileDescriptor(project, virtualFile, lineNumber == 0 ? lineNumber : lineNumber+1, 0), true));
    }
}
