import { Stack } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import AuthProvider, { useAuth } from "../providers/auth-provider";
import { QueryProvider } from "../providers/query-provider";
import NotificationProvider from "../providers/notification-provider";
import LoadingScreen from "../components/loading-screen";
import { View, Text, StyleSheet } from "react-native";

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

  // Show loading screen while auth state is being determined
  if (mounting) {
    return <LoadingScreen />;
  }

  // Use Stack for all navigation scenarios
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!session ? (
        // Auth routes
        <>
          <Stack.Screen name="auth" />
          <Stack.Screen name="signup" />
        </>
      ) : !user?.name ? (
        // Registration route
        <Stack.Screen name="register" options={{ gestureEnabled: false }} />
      ) : (
        // Main app routes
        <>
          <Stack.Screen name="(shop)" />
          <Stack.Screen name="cart" options={{ presentation: "modal" }} />
          <Stack.Screen name="profile" />
        </>
      )}
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
