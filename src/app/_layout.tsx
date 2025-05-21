import { Stack } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import AuthProvider, { useAuth } from "../providers/auth-provider";
import { QueryProvider } from "../providers/query-provider";
import NotificationProvider from "../providers/notification-provider";
import LoadingScreen from "../components/loading-screen";
import { View, Text, StyleSheet } from "react-native";
import { Redirect } from "expo-router";

// Typed root layout
export default function RootLayout() {
  return (
    <QueryProvider>
      <AuthProvider>
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
      </AuthProvider>
    </QueryProvider>
  );
}

function RootLayoutNav() {
  const { mounting, session, user } = useAuth();

  if (mounting) {
    return <LoadingScreen />;
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
