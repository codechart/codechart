package ua.haltentech.plugin.webview.actions;

import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.actionSystem.CommonDataKeys;
import com.intellij.openapi.project.Project;
import org.jetbrains.annotations.NotNull;
import ua.haltentech.plugin.webview.browser.BrowserService;

public class SendToWebViewRefreshAction extends AnAction {
    @Override
    public void actionPerformed(@NotNull AnActionEvent actionEvent) {
        Project project = actionEvent.getData(CommonDataKeys.PROJECT);

        if (project == null) {
            return;
        }

        // Reloading fires CefLoadHandler.onLoadEnd, which re-injects the IDE bridge.
        // No sleep, no manual init() call.
        project.getService(BrowserService.class).loadWebview();
    }
}
