package ua.haltentech.plugin.webview;

import com.intellij.notification.NotificationGroupManager;
import com.intellij.notification.NotificationType;
import com.intellij.openapi.project.Project;

public class Util {

    public static boolean isNumber(String sourceStr) {
        if (sourceStr == null) {
            return false;
        }

        try {
            Double.parseDouble(sourceStr);
        } catch (NumberFormatException nfe) {
            return false;
        }

        return true;
    }

    public static void showError(Project project, String message) {
        NotificationGroupManager.getInstance()
                .getNotificationGroup("Webview Notification Group")
                .createNotification(message, NotificationType.ERROR)
                .notify(project);
    }
}
