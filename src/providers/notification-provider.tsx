import { useState, useEffect, useRef, PropsWithChildren } from "react";
import * as Notifications from "expo-notifications";
import registerForPushNotificationsAsync from "../lib/notifications";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/auth-provider";
import Toast from "react-native-toast-message";
import React from "react";

// Configure how notifications should be handled when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const NotificationsProvider = ({ children }: PropsWithChildren) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const { session } = useAuth();

  const saveUserPushNotificationToken = async (token: string) => {
    if (!token || !session?.user?.id) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({
          expo_notification_token: token,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id);

      if (error) throw error;

      console.log("Successfully saved push token to database");
    } catch (error) {
      console.error("Failed to save notification token:", error);
      Toast.show({
        type: "custom_toast",
        position: "bottom",
        props: {
          title: "Error",
          message: "Failed to save notification token",
        },
      });
    }
  };

  useEffect(() => {
    // Initialize notifications
    const initNotifications = async () => {
      try {
        // Always attempt to get token, even in development
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setExpoPushToken(token);
          await saveUserPushNotificationToken(token);
        }

        // Set up notification listeners
        notificationListener.current =
          Notifications.addNotificationReceivedListener((notification) => {
            console.log("Notification received:", notification);
            // You can add additional handling here
          });

        responseListener.current =
          Notifications.addNotificationResponseReceivedListener((response) => {
            console.log("Notification response:", response);
            // Handle notification taps here
          });

        // Handle any initial notification that launched the app
        const initialNotification =
          await Notifications.getLastNotificationResponseAsync();
        if (initialNotification) {
          console.log("App launched by notification:", initialNotification);
        }
      } catch (error) {
        console.error("Notification initialization error:", error);
      }
    };

    initNotifications();

    return () => {
      // Clean up listeners
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [session?.user?.id]); // Re-run if user changes

  return <>{children}</>;
};

export default NotificationsProvider;
