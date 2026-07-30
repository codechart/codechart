package ua.haltentech.plugin.webview;

import com.intellij.openapi.project.Project;
import com.intellij.openapi.wm.ToolWindow;
import com.intellij.openapi.wm.ToolWindowFactory;
import com.intellij.ui.components.JBLabel;
import com.intellij.ui.content.Content;
import com.intellij.ui.content.ContentFactory;
import com.intellij.ui.jcef.JBCefApp;
import org.jetbrains.annotations.NotNull;
import ua.haltentech.plugin.webview.browser.BrowserService;

import javax.swing.SwingConstants;

public class WebviewToolwindowFactory implements ToolWindowFactory {
    @Override
    public void createToolWindowContent(@NotNull Project project, @NotNull ToolWindow toolWindow) {
        ContentFactory contentFactory = ContentFactory.getInstance();

        if (!JBCefApp.isSupported()) {
            // No silent fallback: report it in the notification area and in the tool window itself.
            Util.showError(project, BrowserService.JCEF_UNAVAILABLE_MESSAGE);

            JBLabel unavailable = new JBLabel("<html><body style='padding:10px'>"
                    + BrowserService.JCEF_UNAVAILABLE_MESSAGE + "</body></html>");

            unavailable.setVerticalAlignment(SwingConstants.TOP);

            toolWindow.getContentManager().addContent(contentFactory.createContent(unavailable, "", false));

            return;
        }

        BrowserService browserService = project.getService(BrowserService.class);

        Content content = contentFactory.createContent(browserService.getBrowser().getComponent(), "", false);

        toolWindow.getContentManager().addContent(content);

        // The IDE bridge is injected by BrowserService's CefLoadHandler once the page reports
        // onLoadEnd - no sleeping thread, no double init.
        browserService.loadWebview();
    }
}
