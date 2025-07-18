import { useState, useEffect, useRef, PropsWithChildren } from "react";
import * as Notifications from "expo-notifications";
import registerForPushNotificationsAsync from "../lib/notifications";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/auth-provider";
import { AppState } from "react-native";

// 1. Setup Channel Android (Pindahkan ke luar komponen)
async function setupNotificationChannels() {
  await Notifications.setNotificationChannelAsync("user-specific", {
    name: "User Notifications",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

// 2. Konfigurasi awal
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NotificationsProvider = ({ children }: PropsWithChildren) => {
  const { session, user: currentUser } = useAuth(); // Gunakan user dari useAuth
  const notificationListener = useRef<Notifications.Subscription | null>(null);

  // 3. Setup token dan listeners
  const initNotifications = async () => {
    if (!currentUser?.id) return;

    try {
      // Setup channel (dipanggil sekali saat inisialisasi)
      await setupNotificationChannels();

      const token = await registerForPushNotificationsAsync(currentUser.id);
      if (!token) return;

      // Simpan token ke database
      await supabase
        .from("users")
        .update({
          expo_notification_token: token,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentUser.id);

      // Setup listener tunggal
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          const targetUserId = notification.request.content.data.userId;

          // Filter berdasarkan user
          if (targetUserId !== currentUser.id) return;

          // Android akan otomatis pakai config dari app.json
          console.log("Notification received for current user");
        });
    } catch (error) {
      console.error("Notification error:", error);
    }
  };

  useEffect(() => {
    initNotifications();

    const appStateSubscription = AppState.addEventListener(
      "change",
      async (state) => {
        if (state === "active") await initNotifications();
      }
    );

    return () => {
      notificationListener.current?.remove();
      appStateSubscription.remove();
    };
  }, [currentUser?.id]);

  return <>{children}</>;
};

export default NotificationsProvider;
