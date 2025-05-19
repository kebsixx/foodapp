import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { View } from "react-native";

export default function ShopLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#B17457",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          width: "80%",
          marginHorizontal: "10%",
          elevation: 4,
          backgroundColor: "#fff",
          borderRadius: 15,
          height: 70,
          alignItems: "center",
          paddingVertical: 8,
          paddingHorizontal: 15,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
          borderTopWidth: 0,
        },
        tabBarItemStyle: {
          paddingTop: 8,
          height: 60,
        },
        tabBarIconStyle: {
          marginBottom: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: 8,
        },
        tabBarBackground: () => (
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 15,
              flex: 1,
            }}
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <Feather name="shopping-bag" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
