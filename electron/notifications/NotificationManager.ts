import { Notification } from 'electron';

export class NotificationManager {
  public static isSupported(): boolean {
    return Notification.isSupported();
  }

  public static show(title: string, body: string): boolean {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const notification = new Notification({
        title,
        body,
        silent: false,
      });

      notification.show();
      return true;
    } catch (err) {
      console.warn('[NotificationManager] Failed to show notification:', err);
      return false;
    }
  }
}
