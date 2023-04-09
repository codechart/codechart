package ua.haltentech.plugin.webview;

import com.intellij.openapi.project.Project;
import com.intellij.openapi.wm.ToolWindow;
import com.intellij.openapi.wm.ToolWindowFactory;
import org.cef.CefApp;
import org.jetbrains.annotations.NotNull;
import ua.haltentech.plugin.webview.browser.BrowserService;
import ua.haltentech.plugin.webview.browser.LocalResourceSchemeHandlerFactory;

public class WebviewToolwindowFactory implements ToolWindowFactory {
    @Override
    public void createToolWindowContent(@NotNull Project project, @NotNull ToolWindow toolWindow) {
        String httpPluginPath = "http://plugin";

        BrowserService browserService = project.getService(BrowserService.class);

        CefApp.getInstance()
                .registerSchemeHandlerFactory("http", "plugin", new LocalResourceSchemeHandlerFactory(httpPluginPath));

        browserService.getBrowser().loadURL(httpPluginPath + "/ide-plugin_new.html");

        toolWindow.getComponent().getParent().add(browserService.getBrowser().getComponent());


        browserService.init();

        // Lambda Runnable
        Runnable init = () -> {
            try {
                Thread.sleep(4000);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            browserService.init();
        };

// start the thread
        new Thread(init).start();
    }
}
