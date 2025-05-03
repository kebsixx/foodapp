import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../lib/supabase";
import { useToast } from "react-native-toast-notifications";
import { useAuth } from "../providers/auth-provider";
import { Link, Redirect } from "expo-router";
import React from "react";

const authSchema = zod.object({
  email: zod.string().email({ message: "Invalid email address" }),
  password: zod
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function Auth() {
  const { session } = useAuth();
  const Toast = useToast();

  if (session) return <Redirect href="/" />;

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signIn = async (data: zod.infer<typeof authSchema>) => {
    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      alert(error.message);
    } else {
      Toast.show("Selamat datang kembali!", {
        type: "custom_toast",
        animationDuration: 100,
        data: {
          title: `Sign in successfully 🎉`,
        },
      });
    }
  };

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1511081692775-05d0f180a065?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      }}
      style={styles.backgroundImage}>
      <View style={styles.overlay} />

      <View style={styles.container}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Silahkan login untuk berbelanja</Text>

        <Controller
          control={control}
          name="email"
          render={({
            field: { value, onChange, onBlur },
            fieldState: { error },
          }) => (
            <>
              <TextInput
                placeholder="Email"
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                editable={!formState.isSubmitting}
              />
              {error && <Text style={styles.error}>{error.message}</Text>}
            </>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({
            field: { value, onChange, onBlur },
            fieldState: { error },
          }) => (
            <>
              <TextInput
                placeholder="Password"
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                placeholderTextColor="#aaa"
                autoCapitalize="none"
                editable={!formState.isSubmitting}
              />
              {error && <Text style={styles.error}>{error.message}</Text>}
            </>
          )}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(signIn)}
          disabled={formState.isSubmitting}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 16,
        }}>
        <Text style={{ color: "#fff", fontSize: 16 }}>Belum punya Akun?</Text>
        <Link href="/signup" style={styles.signUpButton}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </Link>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    width: "100%",
  },
  title: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#ddd",
    marginBottom: 32,
  },
  input: {
    width: "90%",
    padding: 12,
    paddingLeft: 20,
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 50,
    fontSize: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "#B17457",
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
    width: "90%",
    alignItems: "center",
  },
  signUpButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  signUpButtonText: {
    color: "#fff",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 16,
    textAlign: "left",
    width: "90%",
  },
  socialButtonsContainer: {
    width: "90%",
    marginBottom: 20,
  },
  googleButton: {
    width: "100%",
    height: 48,
  },
});
