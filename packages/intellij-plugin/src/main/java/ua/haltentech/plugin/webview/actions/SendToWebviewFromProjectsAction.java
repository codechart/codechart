package ua.haltentech.plugin.webview.actions;

import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.actionSystem.CommonDataKeys;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.vfs.VirtualFile;
import org.jetbrains.annotations.NotNull;
import ua.haltentech.plugin.webview.browser.BrowserService;
import ua.haltentech.plugin.webview.browser.JsFunctionParameters;
import ua.haltentech.plugin.webview.ide.IdeService;

import java.util.ArrayList;
import java.util.List;

public class SendToWebviewFromProjectsAction extends AnAction {
    @Override
    public void actionPerformed(@NotNull AnActionEvent actionEvent) {
        Project project = actionEvent.getData(CommonDataKeys.PROJECT);

        if (project == null) {
            return;
        }

        VirtualFile virtualFile = actionEvent.getData(CommonDataKeys.VIRTUAL_FILE);

        if (virtualFile == null) {
            return;
        }

        JsFunctionParameters parameters = JsFunctionParameters.of(
                "SendToWebviewFromEditorAction",
                virtualFile.getPath(),
                project.getBasePath(),
                "",
                0,
                project.getService(IdeService.class).getFileContent(virtualFile),
                getFolderFiles(virtualFile));

        project.getService(BrowserService.class).executeClickedOnFileFunction(parameters);
    }

    private List<String> getFolderFiles(VirtualFile virtualFile) {
        List<String> files = new ArrayList<>();

        if (virtualFile.isDirectory()) {
            for (VirtualFile childVirtualFile : virtualFile.getChildren()) {
                files.add(childVirtualFile.getPath());
            }
        }

        return files;
    }
}
