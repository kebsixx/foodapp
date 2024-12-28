import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";

const Button = ({
  buttonStyles,
  textStyles,
  title = "",
  onPress = () => {},
  loading = false,
  hasShadow = true,
}) => {
  const shadowStyle = {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  };

  if (loading) {
    return (
      <View style={[buttonStyles, styles.button]}>
        <Text style={[styles.text, textStyles]}>Loading...</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[buttonStyles, hasShadow && shadowStyle, styles.button]}>
      <Text style={[styles.text, textStyles]}>{title}</Text>
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#000",
    borderRadius: 18,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
