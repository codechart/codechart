package ua.haltentech.plugin.webview.actions;

import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.actionSystem.CommonDataKeys;
import com.intellij.openapi.project.Project;
import org.jetbrains.annotations.NotNull;
import ua.haltentech.plugin.webview.browser.BrowserService;

public class GetProjectPathAction extends AnAction {
    @Override
    public void actionPerformed(@NotNull AnActionEvent actionEvent) {
        Project project = actionEvent.getData(CommonDataKeys.PROJECT);

        if (project == null) {
            return;
        }

        project.getService(BrowserService.class).executeGetProjectPathFunction();
    }
} 