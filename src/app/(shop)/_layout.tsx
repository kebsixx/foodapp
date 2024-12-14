import { Redirect, Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useAuth } from "../../providers/auth-provider";
import { ToastProvider } from "react-native-toast-notifications";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof AntDesign>["name"];
  color: string;
}) {
  return <AntDesign size={24} style={{ color: "#000" }} {...props} />;
}

const TabsLayout = () => {
  const { session, mounting } = useAuth();

  if (mounting) return <ActivityIndicator />;
  if (!session) return <Redirect href="/auth" />;

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
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#B17457",
            tabBarInactiveTintColor: "gray",
            tabBarLabelStyle: { fontSize: 16 },
            tabBarStyle: {
              height: 60,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingTop: 10,
            },
            headerShown: false,
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: (props) => <TabBarIcon name="home" {...props} />,
            }}
          />
          <Tabs.Screen
            name="orders"
            options={{
              title: "Orders",
              tabBarIcon: (props) => (
                <TabBarIcon name="shoppingcart" {...props} />
              ),
            }}
          />
        </Tabs>
      </SafeAreaView>
    </ToastProvider>
  );
};

export default TabsLayout;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
