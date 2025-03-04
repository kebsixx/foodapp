import { useState, useEffect, useRef, PropsWithChildren } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { supabase } from "../lib/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NotificationsProvider = ({ children }: PropsWithChildren) => {
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const [notification, setNotification] =
    useState<Notifications.Notification>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: "your-project-id", // Get this from app.json
        })
      ).data;
    } else {
      console.log("Must use physical device for Push Notifications");
    }

    return token;
  }

  const saveUserPushNotificationToken = async (token: string) => {
    if (!token) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from("users")
      .update({ expo_notification_token: token })
      .eq("id", session.user.id);
  };

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          setExpoPushToken(token);
          saveUserPushNotificationToken(token);
        }
      })
      .catch((err) => console.error("Failed to get push token:", err));

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) =>
        setNotification(notification)
      );

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        // Handle notification response here
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return <>{children}</>;
};

export default NotificationsProvider;
