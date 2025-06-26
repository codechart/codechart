package ua.haltentech.plugin.webview.browser;

import org.cef.callback.CefCallback;
import org.cef.handler.CefLoadHandler;
import org.cef.misc.IntRef;
import org.cef.misc.StringRef;
import org.cef.network.CefResponse;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLConnection;

public class OpenedConnectionState implements ResourceHandlerState {
    private final URLConnection connection;

    private InputStream inputStream;

    public OpenedConnectionState(URLConnection connection) {
        this.connection = connection;
    }

    @Override
    public void getResponseHeaders(CefResponse cefResponse, IntRef responseLength, StringRef redirectUrl) {
        try {
            inputStream = connection.getInputStream();

            String url = connection.getURL().toString();

            if (url.contains("css")) {
                cefResponse.setMimeType("text/css");
            } else if (url.contains("js")) {
                cefResponse.setMimeType("text/javascript");
            } else if (url.contains("html")) {
                cefResponse.setMimeType("text/html");
            } else {
                cefResponse.setMimeType(connection.getContentType());
            }

            cefResponse.setStatus(200);
        } catch (IOException e) {
            cefResponse.setError(CefLoadHandler.ErrorCode.ERR_FILE_NOT_FOUND);
            cefResponse.setStatusText(e.getLocalizedMessage());
            cefResponse.setStatus(404);
        }
    }

    @Override
    public boolean readResponse(byte[] dataOut, int designedBytesToRead, IntRef bytesRead, CefCallback callback) {
        try {
            int availableSize = inputStream.available();

            if (availableSize > 0) {
                int maxBytesToRead = Math.min(availableSize, designedBytesToRead);
                int realNumberOfReadBytes = inputStream.read(dataOut, 0, maxBytesToRead);

                bytesRead.set(realNumberOfReadBytes);

                return true;
            }
        } catch (IOException e) {
            System.out.println(e.getLocalizedMessage());
        }

        closeInputStream();

        return false;
    }

    @Override
    public void close() {
        closeInputStream();
    }

    private void closeInputStream() {
        try {
            inputStream.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
