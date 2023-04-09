package ua.haltentech.plugin.webview.browser;

import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.callback.CefSchemeHandlerFactory;
import org.cef.handler.CefResourceHandler;
import org.cef.network.CefRequest;

public class LocalResourceSchemeHandlerFactory implements CefSchemeHandlerFactory {
    private final String httpPluginPath;

    public LocalResourceSchemeHandlerFactory(String httpPluginPath) {
        this.httpPluginPath = httpPluginPath;
    }

    @Override
    public CefResourceHandler create(CefBrowser browser, CefFrame frame, String schemeName, CefRequest request) {
        return new LocalResourceHandler(httpPluginPath);
    }
}