import { View, StyleSheet, Pressable, Text } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "../icon";
import { router } from "expo-router";

const signUp = () => {
  const { top } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 5 : 30;

  return (
    <View
      style={{
        flex: 1,
        paddingTop,
        backgroundColor: "#fff",
        gap: 45,
        paddingHorizontal: 15,
      }}>
      <Pressable onPress={() => router.back()} style={styles.button}>
        <Icon
          name="arrowLeft"
          strokeWidth={1.5}
          size={24}
          color="#000"
          backgroundColor="#eee"
        />
      </Pressable>

      <View>
        <Text style={styles.welcomeText}>Hey,</Text>
        <Text style={styles.welcomeText}>Selamat Datang</Text>
      </View>

      <View>
        <Text>Silahkan daftar akun terlebih dahulu</Text>
      </View>
    </View>
  );
};

export default signUp;

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    padding: 5,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: "bold",
  },
});
