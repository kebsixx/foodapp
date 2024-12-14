import { Stack } from "expo-router";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ToastProvider } from "react-native-toast-notifications";

export default function ProductLayout() {
  return (
    <ToastProvider
      placement="top"
      duration={2000}
      offset={40}
      renderType={{
        custom_toast: (toast) => (
          <View
            style={{
              maxWidth: "85%",
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
      <Stack>
        <Stack.Screen
          name="[slug]"
          options={({ navigation }) => ({
            headerShown: true,
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
            ),
          })}
        />
      </Stack>
    </ToastProvider>
  );
}
