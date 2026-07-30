package ua.haltentech.plugin.webview;

import com.intellij.notification.NotificationGroupManager;
import com.intellij.notification.NotificationType;
import com.intellij.openapi.project.Project;

public class Util {
    /** Must stay in sync with the notificationGroup id declared in META-INF/plugin.xml. */
    public static final String NOTIFICATION_GROUP_ID = "Cochart Notifications";

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
                .getNotificationGroup(NOTIFICATION_GROUP_ID)
                .createNotification(message, NotificationType.ERROR)
                .notify(project);
    }
}
