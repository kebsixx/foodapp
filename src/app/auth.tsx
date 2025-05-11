import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../lib/supabase";
import { useToast } from "react-native-toast-notifications";
import { useAuth } from "../providers/auth-provider";
import { Link, Redirect } from "expo-router";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

const authSchema = zod.object({
  login: zod.string().min(1, { message: "Email or username is required" }),
  password: zod
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function Auth() {
  const { session } = useAuth();
  const Toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [secureEntry, setSecureEntry] = useState(true);

  if (session) return <Redirect href="/" />;

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  const signIn = async (data: zod.infer<typeof authSchema>) => {
    setIsLoading(true);
    try {
      const isEmail = data.login.includes("@");
      let emailToUse = data.login;

      if (!isEmail) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("email")
          .eq("username", data.login.trim().toLowerCase())
          .single();

        if (userError || !userData?.email) {
          throw new Error("Invalid username or password");
        }
        emailToUse = userData.email;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: data.password,
      });

      if (error) throw error;

      Toast.show("🎉 You've successfully logged in", {
        type: "custom_toast",
        duration: 2000,
        data: {
          title: "Welcome Back!",
        },
      });
    } catch (error: any) {
      Toast.show("Login Failed", {
        type: "custom_toast",
        duration: 3000,
        data: {
          title: "Login Failed",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1511081692775-05d0f180a065?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        }}
        style={styles.backgroundImage}
        blurRadius={5}>
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.5)"]}
          style={styles.overlay}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Cerita Senja</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your journey
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="login"
              render={({
                field: { value, onChange, onBlur },
                fieldState: { error },
              }) => (
                <View style={styles.inputGroup}>
                  <Feather
                    name="user"
                    size={20}
                    color="#B17457"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Email or Username"
                    placeholderTextColor="#aaa"
                    style={[styles.input, error && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({
                field: { value, onChange, onBlur },
                fieldState: { error },
              }) => (
                <View style={styles.inputGroup}>
                  <Feather
                    name="lock"
                    size={20}
                    color="#B17457"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    style={[styles.input, error && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={secureEntry}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setSecureEntry(!secureEntry)}>
                    <Feather
                      name={secureEntry ? "eye-off" : "eye"}
                      size={20}
                      color="#aaa"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit(signIn)}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Link href="/signup" style={styles.signUpLink}>
              <Text style={styles.signUpLinkText}>Create one</Text>
            </Link>
          </View>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
    fontFamily: "sans-serif-medium",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333",
  },
  inputError: {
    borderColor: "#ff4444",
    borderWidth: 1,
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: "#B17457",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "rgba(255,255,255,0.8)",
    marginRight: 5,
  },
  signUpLink: {
    paddingHorizontal: 5,
  },
  signUpLinkText: {
    color: "#B17457",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
