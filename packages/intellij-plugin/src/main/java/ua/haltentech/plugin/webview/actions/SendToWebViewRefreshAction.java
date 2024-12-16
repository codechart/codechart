package ua.haltentech.plugin.webview.actions;

import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.actionSystem.CommonDataKeys;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.vfs.VirtualFile;
import org.jetbrains.annotations.NotNull;
import ua.haltentech.plugin.webview.browser.BrowserService;

import java.util.ArrayList;
import java.util.List;

public class SendToWebViewRefreshAction extends AnAction {
    @Override
    public void actionPerformed(@NotNull AnActionEvent actionEvent) {
        Project project = actionEvent.getData(CommonDataKeys.PROJECT);
        project.getService(BrowserService.class).getBrowser().loadURL("http://plugin/" + "ij-plugin.html");
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        project.getService(BrowserService.class).init();
    }

}
