import { StyleSheet, Text, TextInput, View } from "react-native";
import React from "react";

const Input = (props) => {
  return (
    <View
      style={[
        styles.container,
        props.containerStyles && props.containerStyles,
      ]}>
      {props.icon && props.icon}
      <TextInput
        style={{ flex: 1 }}
        placeholderTextColor="#000"
        ref={props.inputRef && props.inputRef}
        {...props}
      />
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 18,
    borderCurve: "continuous",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
});
