import notifee, {
  AndroidImportance,
  EventType,
  Notification,
  Trigger,
} from "@notifee/react-native";
import { defaultChannel, triggerChannel } from "@/constants/notification";

type NotificationForwardingFunction = (arg0: any) => void;
/**
 * WIP
 */
export default class NotifeeManager {
  private static instance: NotifeeManager;

  forwardNotificationFn: NotificationForwardingFunction | null = null;

  public static getInstance(): NotifeeManager {
    if (!NotifeeManager.instance) {
      NotifeeManager.instance = new NotifeeManager();
    }

    return NotifeeManager.instance;
  }

  private constructor() {
    this.createDefaultChannels();
    this.onForegroundEvent();
    this.onBackgroundEvent();
  }

  async createDefaultChannels() {
    await notifee.createChannel({
      id: defaultChannel.id,
      name: defaultChannel.name,
      importance: AndroidImportance.HIGH,
      sound: "default",
    });
    await notifee.createChannel({
      id: triggerChannel.id,
      name: triggerChannel.name,
      importance: AndroidImportance.HIGH,
      sound: "default",
    });
    // console.log('---------createDefaultChannels---------');
  }

  /**
   *
   * @param title
   * @param body
   * @param trigger
   */
  async createTriggerNotification(
    notification: Notification,
    trigger: Trigger
  ) {
    const res = await notifee.createTriggerNotification(
      {
        id: notification.id,
        title: notification.title,
        subtitle: notification.subtitle,
        body: notification.body,
        data: notification.data,
        android: notification.android || {
          channelId: triggerChannel.id,
          pressAction: {
            id: "default",
          },
          sound: "default",
          // actions: NEW_TASK_OPTIONS_ANDROID,
        },
        ios: notification.ios || {
          // categoryId: NEW_TASK_CATEGORY,
          sound: "default",
        },
      },
      trigger
    );
    return res;
  }

  async cancelTriggerNotifications(notificationIds?: string[]) {
    await notifee.cancelTriggerNotifications(notificationIds);
  }

  /**
   *
   * @param title
   * @param body
   * @param subtitle
   * @param data
   */
  async displayNotification(notification: Notification) {
    await notifee.displayNotification({
      android: {
        channelId: defaultChannel.id,
        sound: "default",
      },
      ios: {
        sound: "default",
      },
      ...notification,
    });
  }

  async getInitialPushNotification() {
    return await notifee.getInitialNotification();
  }

  setNotificationForwardingFunction(
    forwardNotification: NotificationForwardingFunction
  ) {
    this.forwardNotificationFn = forwardNotification;
  }

  onForegroundEvent() {
    notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DISMISSED:
          // console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          // console.log('User pressed notification', detail.notification);
          if (this.forwardNotificationFn && detail.notification) {
            this.forwardNotificationFn(detail.notification);
          }
          break;
      }
    });
  }

  /**
   * TODO: define all action and handle
   */
  onBackgroundEvent() {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      switch (type) {
        case EventType.PRESS:
          if (this.forwardNotificationFn && detail.notification) {
            this.forwardNotificationFn(detail.notification);
          }
          break;
      }
    });
  }

  async removeBadgeCount() {
    await notifee.setBadgeCount(0);
  }
}
