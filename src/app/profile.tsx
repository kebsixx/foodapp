import { View, Text, Image } from "react-native";
import React from "react";
import { useAuth } from "../providers/auth-provider";

const Profile = () => {
  const { user } = useAuth();

  console.log(user);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Image
        source={{ uri: user.avatar_url }}
        style={{ width: 100, height: 100, borderRadius: 50 }}
      />
      <Text>{user.name}</Text>
      <Text>{user.email}</Text>
      <Text>{user.address}</Text>
      <Text>{user.phone}</Text>
    </View>
  );
};

export default Profile;
