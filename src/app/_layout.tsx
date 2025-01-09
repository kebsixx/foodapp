import { Stack } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import AuthProvider, { useAuth } from "../providers/auth-provider";
import { QueryProvider } from "../providers/query-provider";
import NotificationProvider from "../providers/notification-provider";
import { View, Text, ActivityIndicator } from "react-native";

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10 }}>Loading...</Text>
    </View>
  );
}

function StackNavigator() {
  const { mounting } = useAuth();

  if (mounting) {
    return <LoadingScreen />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="(shop)"
        options={{ headerShown: false, title: "Shop" }}
      />
      <Stack.Screen
        name="categories"
        options={{ headerShown: false, title: "Categories" }}
      />
      <Stack.Screen
        name="product"
        options={{ headerShown: false, title: "Product" }}
      />
      <Stack.Screen
        name="cart"
        options={{ presentation: "modal", title: "Shopping Cart" }}
      />
      <Stack.Screen
        name="auth"
        options={{ headerShown: false, title: "Auth" }}
      />
      <Stack.Screen
        name="signup"
        options={{ headerShown: false, title: "Register" }}
      />
      <Stack.Screen
        name="profile"
        options={{ title: "Account", presentation: "modal" }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: false,
          title: "Register",
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ToastProvider
      placement="top"
      duration={2000}
      offset={40}
      renderType={{
        custom_toast: (toast) => (
          <View
            style={{
              minWidth: "90%",
              paddingHorizontal: 15,
              paddingVertical: 10,
              backgroundColor: "#fff",
              marginVertical: 4,
              borderRadius: 8,
              borderLeftColor: "#997C70",
              borderLeftWidth: 6,
              justifyContent: "center",
              paddingLeft: 16,
            }}>
            <Text
              style={{
                fontSize: 14,
                color: "#333",
                fontWeight: "bold",
              }}>
              {toast.data.title}
            </Text>
            <Text style={{ color: "#a3a3a3", marginTop: 2 }}>
              {toast.message}
            </Text>
          </View>
        ),
      }}>
      <AuthProvider>
        <QueryProvider>
          <NotificationProvider>
            <StackNavigator />
          </NotificationProvider>
        </QueryProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
