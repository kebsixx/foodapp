import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  Animated,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { useRef } from "react";
import ScrollContext from "../../contexts/_ScrollContext";

const TAB_BAR_HEIGHT = 60;

function CustomTabBar({
  state,
  descriptors,
  navigation,
  translateY,
}: {
  state: any;
  descriptors: any;
  navigation: any;
  translateY: any;
}) {
  return (
    <Animated.View
      style={[styles.tabBarContainer, { transform: [{ translateY }] }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const color = isFocused ? "#B17457" : "#666";

        const tabBarIcon = options.tabBarIcon;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.tabBarItem}>
            {/* Panggil fungsi tabBarIcon yang sudah kita ambil */}
            {tabBarIcon && tabBarIcon({ color, focused: isFocused, size: 24 })}

            <Text style={{ color, ...styles.tabBarLabel }}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
}

export default function ShopLayout() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const clampedScrollY = Animated.diffClamp(scrollY, 0, TAB_BAR_HEIGHT);
  const translateY = clampedScrollY.interpolate({
    inputRange: [0, TAB_BAR_HEIGHT],
    outputRange: [0, TAB_BAR_HEIGHT + 30],
    extrapolate: "clamp",
  });

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  return (
    <ScrollContext.Provider value={{ onScroll }}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} translateY={translateY} />}
        screenOptions={{
          headerShown: false,
        }}>
        {/* Definisi tabBarIcon di sini sekarang akan berfungsi */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: "Orders",
            tabBarIcon: ({ color, size }) => (
              <Feather name="shopping-bag" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </ScrollContext.Provider>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    height: TAB_BAR_HEIGHT,
    backgroundColor: "#fff",
    borderTopColor: "#eee",
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 8,
  },
  tabBarItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
});
