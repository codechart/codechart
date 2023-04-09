package ua.haltentech.plugin.webview.browser;

import org.cef.callback.CefCallback;
import org.cef.handler.CefResourceHandler;
import org.cef.misc.IntRef;
import org.cef.misc.StringRef;
import org.cef.network.CefRequest;
import org.cef.network.CefResponse;

import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.util.Objects;

class LocalResourceHandler implements CefResourceHandler {
    private final String httpPluginPath;
    private ResourceHandlerState state = new ClosedConnectionState();

    public LocalResourceHandler(String httpPluginPath) {
        this.httpPluginPath = httpPluginPath;
    }

    @Override
    public boolean processRequest(CefRequest cefRequest, CefCallback cefCallback) {
        if (cefCallback == null) {
            return false;
        }

        if (cefRequest == null || Objects.equals(cefRequest.getURL(), "")) {
            return false;
        }

        String pathToResource = cefRequest.getURL().replace(httpPluginPath, "/webview");
        URL newUrl = LocalResourceHandler.class.getResource(pathToResource);

        if (newUrl == null) {
            return false;
        }

        try {
            URLConnection urlConnection = newUrl.openConnection();

            state = new OpenedConnectionState(urlConnection);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        cefCallback.Continue();

        return true;
    }

    @Override
    public void getResponseHeaders(CefResponse cefResponse, IntRef responseLength, StringRef redirectUrl) {
        state.getResponseHeaders(cefResponse, responseLength, redirectUrl);
    }

    @Override
    public boolean readResponse(byte[] dataOut, int bytesToRead, IntRef bytesRead, CefCallback callback) {
        return state.readResponse(dataOut, bytesToRead, bytesRead, callback);
    }

    @Override
    public void cancel() {
        state.close();

        state = new ClosedConnectionState();
    }
}
