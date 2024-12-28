import { View, StyleSheet, Pressable, Text, TextInput } from "react-native";
import React, { useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "../icon";
import { useRouter } from "expo-router";
import Input from "../components/Input";
import Button from "../components/Button";

const signUp = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const nameRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      alert("Email dan Password tidak boleh kosong");
      return;
    }
  };

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

      <View style={{ gap: 20 }}>
        <Text>Silahkan daftar akun terlebih dahulu</Text>
        <Input
          icon={<Icon name="user" size={26} strokeWidth={1.6} />}
          placeholder="Masukkan Nama"
          onChangeText={(value: string) => (emailRef.current = value)}
        />
        <Input
          icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
          placeholder="Masukkan Email"
          onChangeText={(value: string) => (emailRef.current = value)}
        />
        <Input
          icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
          placeholder="Masukkan Password"
          secureTextEntry
          onChangeText={(value: string) => (emailRef.current = value)}
        />
        <Text style={{ alignSelf: "flex-end", fontWeight: "bold" }}>
          Lupa Password?
        </Text>
        <Button
          title="Daftar"
          loading={loading}
          onPress={onSubmit}
          buttonStyles={undefined}
          textStyles={undefined}
        />
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
