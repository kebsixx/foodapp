import { useState, useEffect, useRef, PropsWithChildren } from "react";
import * as Notifications from "expo-notifications";
import registerForPushNotificationsAsync from "../lib/notifications";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/auth-provider";
import Toast from "react-native-toast-message";
import { AppState } from "react-native";

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
  const { session, profile } = useAuth();

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

  const syncPushToken = async (newToken: string) => {
    const currentTokenInDb = profile?.expo_notification_token;

    // HANYA UPDATE JIKA TOKEN BERBEDA!
    // Ini adalah kunci utama untuk mencegah update yang tidak perlu.
    if (currentTokenInDb === newToken) {
      console.log("Push token is already up to date.");
      return;
    }

    console.log(
      "New or different push token detected. Syncing with database..."
    );
    try {
      if (!session?.user?.id) {
        console.error("No session or user ID found when syncing push token.");
        return;
      }
      const { error } = await supabase
        .from("users")
        .update({
          expo_notification_token: newToken,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id);

      if (error) throw error;

      console.log("Successfully synced push token to database");
    } catch (error) {
      console.error("Failed to sync notification token:", error);
      // Toast tetap bisa digunakan di sini
    }
  };

  useEffect(() => {
    // Fungsi init tetap sama, tapi sekarang memanggil 'syncPushToken'
    const initNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setExpoPushToken(token);
          await syncPushToken(token); // Panggil fungsi yang sudah di-refactor
        }
        // ... (sisa kode listener Anda sudah benar)
      } catch (error) {
        console.error("Notification initialization error:", error);
      }
    };

    if (session?.user?.id) {
      // Jalankan hanya jika ada session
      initNotifications();
    }

    // --- PERUBAHAN 2 (Opsional tapi Sangat Direkomendasikan): Sync saat aplikasi kembali aktif ---
    // Ini menangani kasus jika izin notifikasi diberikan saat aplikasi berjalan
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        console.log("App has come to the foreground, re-checking token.");
        initNotifications();
      }
    });

    return () => {
      // ... (cleanup listener notifikasi Anda sudah benar)
      subscription.remove(); // Jangan lupa cleanup listener AppState
    };
  }, [session?.user?.id, profile?.expo_notification_token]); // Tambahkan token dari profile sebagai dependensi

  return <>{children}</>;
};

export default NotificationsProvider;
