import { View, Text } from "react-native";
import React from "react";
import ArrowLeft from "./ArrowLeft";
import Mail from "./Mail";
import Lock from "./Lock";
import User from "./User";

const icons = {
  arrowLeft: ArrowLeft,
  mail: Mail,
  lock: Lock,
  user: User,
};

const Icon = ({ name, ...props }) => {
  const IconComponent = icons[name];
  return (
    <IconComponent
      height={props.size || 24}
      width={props.size || 24}
      strrokeWidth={props.strokeWidth || 1.9}
      color={props.color || "#000"}
      {...props}
    />
  );
};

export default Icon;
