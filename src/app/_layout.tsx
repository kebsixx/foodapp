import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as Linking from "expo-linking";
import { ToastProvider } from "react-native-toast-notifications";
import AuthProvider, { useAuth } from "../providers/auth-provider";
import { QueryProvider } from "../providers/query-provider";
import NotificationProvider from "../providers/notification-provider";
import LanguageProvider from "../providers/language-provider";
import LoadingScreen from "../components/loading-screen";
import { View, Text, StyleSheet, Image } from "react-native";
import { useCheckAppUpdate } from "../lib/useCheckAppUpdate";
import {
  registerForPushNotificationsAsync,
  setupNotificationHandlers,
} from "../lib/notifications";

// Typed root layout
export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider
            placement="top"
            duration={3000}
            offset={50}
            renderType={{
              custom_toast: (toast) => (
                <View style={styles.toastContainer}>
                  <Text style={styles.toastTitle}>{toast.data.title}</Text>
                  <Text style={styles.toastMessage}>{toast.message}</Text>
                </View>
              ),
            }}>
            <NotificationProvider>
              <RootLayoutNav />
            </NotificationProvider>
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

function RootLayoutNav() {
  const { mounting, session, user } = useAuth();
  const [appIsReady, setAppIsReady] = useState(false);
  useCheckAppUpdate();

  // Setup notifikasi saat user login
  useEffect(() => {
    if (session?.user?.id && appIsReady) {
      registerForPushNotificationsAsync(session.user.id).catch((error) =>
        console.error("Push registration failed:", error)
      );
    }
  }, [session?.user?.id, appIsReady]);

  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      const { path, queryParams } = Linking.parse(url);
      if (path === "order-detail" && queryParams?.slug) {
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    // Set app ready setelah setup notification selesai
    const setupApp = async () => {
      await setupNotificationHandlers();
      setAppIsReady(true);
    };
    setupApp();
  }, []);

  if (mounting) {
    return <LoadingScreen />;
  }

  if (!appIsReady || mounting) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require("../../assets/splash.png")}
          style={styles.splashImage}
        />
      </View>
    );
  }

  // Jika belum login, arahkan ke auth
  if (!session) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="signup" />
        {/* Redirect semua route ke auth jika belum login */}
        <Stack.Screen name="(shop)" redirect />
        <Stack.Screen name="profile" redirect />
        <Stack.Screen name="cart" redirect />
      </Stack>
    );
  }

  // Jika sudah login tapi belum lengkap profile
  if (!user?.name) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="register" options={{ gestureEnabled: false }} />
        {/* Redirect semua route ke register jika profile belum lengkap */}
        <Stack.Screen name="(shop)" redirect />
        <Stack.Screen name="profile" redirect />
        <Stack.Screen name="cart" redirect />
      </Stack>
    );
  }

  // Jika sudah login lengkap
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(shop)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="cart" options={{ presentation: "modal" }} />
      {/* Redirect auth/signup ke home jika sudah login */}
      <Stack.Screen name="auth" redirect />
      <Stack.Screen name="signup" redirect />
      <Stack.Screen name="register" redirect />
    </Stack>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  splashImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  toastContainer: {
    maxWidth: "85%",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    marginVertical: 4,
    borderRadius: 8,
    borderLeftColor: "#997C70",
    borderLeftWidth: 6,
    justifyContent: "center",
  },
  toastTitle: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  toastMessage: {
    color: "#666",
    marginTop: 2,
  },
});
