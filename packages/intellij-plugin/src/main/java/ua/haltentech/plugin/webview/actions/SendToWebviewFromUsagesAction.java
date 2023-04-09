package ua.haltentech.plugin.webview.actions;

import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.actionSystem.CommonDataKeys;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.vfs.VirtualFile;
import com.intellij.usages.Usage;
import com.intellij.usages.UsageView;
import org.jetbrains.annotations.NotNull;
import ua.haltentech.plugin.webview.browser.BrowserService;
import ua.haltentech.plugin.webview.browser.JsFunctionParameters;

public class SendToWebviewFromUsagesAction extends AnAction {
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

        Usage[] usages = actionEvent.getData(UsageView.USAGES_KEY);
        String content = "";

        if (usages != null && usages.length > 0) {
            content = usages[0].toString();
        }

        JsFunctionParameters parameters = JsFunctionParameters.of(
                "SendToWebviewFromEditorAction",
                virtualFile.getPath(),
                project.getBasePath(),
                content,
                0,
                "");

        project.getService(BrowserService.class).executeClickedOnFileFunction(parameters);
    }
}
