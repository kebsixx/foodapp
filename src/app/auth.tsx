import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../lib/supabase";
import { useToast } from "react-native-toast-notifications";
import { useAuth } from "../providers/auth-provider";
import { Link, Redirect } from "expo-router";
import React, { useState } from "react";
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
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
                    placeholderTextColor="#666"
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
                    placeholderTextColor="#666"
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
                      color="#666"
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
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
    padding: 8,
  },
  button: {
    backgroundColor: "#B17457",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#666",
    marginRight: 4,
  },
  signUpLink: {
    paddingHorizontal: 4,
  },
  signUpLinkText: {
    color: "#B17457",
    fontWeight: "600",
  },
});
