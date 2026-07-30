package ua.haltentech.plugin.webview.browser;

import org.cef.browser.CefBrowser;
import org.cef.browser.CefFrame;
import org.cef.handler.CefRequestHandlerAdapter;
import org.cef.handler.CefResourceHandler;
import org.cef.handler.CefResourceRequestHandler;
import org.cef.handler.CefResourceRequestHandlerAdapter;
import org.cef.misc.BoolRef;
import org.cef.network.CefRequest;

/**
 * Serves the plugin's bundled webview assets for the synthetic {@code http://plugin} origin.
 * <p>
 * This is the documented JCEF interception route ({@code CefRequestHandler} ->
 * {@code CefResourceRequestHandler} -> {@code CefResourceHandler}) and is attached to a single
 * {@code JBCefClient}/{@code CefBrowser} pair. It replaces the previous
 * {@code CefApp.getInstance().registerSchemeHandlerFactory("http", "plugin", ...)} call, which
 * mutated global CEF state, hooked a built-in scheme (unsupported by {@code JBCefApp}) and was
 * re-executed for every project whose tool window was opened.
 * <p>
 * The adapter base classes are used on purpose: JCEF has changed the method set of
 * {@code CefRequestHandler} between platform releases, so implementing the interface directly
 * would break compilation/linkage on future IDEs.
 */
public class LocalResourceRequestHandler extends CefRequestHandlerAdapter {
    private final String httpPluginPath;

    public LocalResourceRequestHandler(String httpPluginPath) {
        this.httpPluginPath = httpPluginPath;
    }

    @Override
    public CefResourceRequestHandler getResourceRequestHandler(CefBrowser browser,
                                                               CefFrame frame,
                                                               CefRequest request,
                                                               boolean isNavigation,
                                                               boolean isDownload,
                                                               String requestInitiator,
                                                               BoolRef disableDefaultHandling) {
        if (request == null) {
            return null;
        }

        String url = request.getURL();

        if (url == null || !url.startsWith(httpPluginPath)) {
            return null;
        }

        disableDefaultHandling.set(true);

        return new CefResourceRequestHandlerAdapter() {
            @Override
            public CefResourceHandler getResourceHandler(CefBrowser browser, CefFrame frame, CefRequest request) {
                return new LocalResourceHandler(httpPluginPath);
            }
        };
    }
}
