import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "../lib/supabase";
import { useToast } from "react-native-toast-notifications";
import { useAuth } from "../providers/auth-provider";
import { Link, Redirect, useRouter, Stack } from "expo-router";
import React, { useEffect } from "react";
import { Feather } from "@expo/vector-icons";

export const authSchema = zod.object({
  email: zod.string().email(),
  password: zod.string().min(6, { message: "Password minimal 6 karakter" }),
});

export default function SignUp() {
  const { session, user } = useAuth();
  const Toast = useToast();
  const router = useRouter();
  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle navigation with useEffect
  useEffect(() => {
    if (session) {
      if (user?.name) {
        router.replace("/(shop)");
      } else {
        router.replace("/register");
      }
    }
  }, [session, user, router]);

  const signUp = async (data: zod.infer<typeof authSchema>) => {
    try {
      const { error } = await supabase.auth.signUp(data);
      if (error) throw error;

      Toast.show("Silahkan lengkapi data diri anda", {
        type: "custom_toast",
        data: { title: "Sign up berhasil" },
      });

      // Force navigation to register
      setTimeout(() => {
        router.replace("/register");
      }, 1000);
    } catch (error) {
      Toast.show(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat signup",
        {
          type: "custom_toast",
          data: { title: "Error" },
        }
      );
    }
  };

  // Remove direct Redirect components and let useEffect handle navigation
  return (
    <>
      <Stack.Screen
        options={{
          title: "Daftar",
          headerShown: false,
          gestureEnabled: false,
        }}
      />

      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Buat Akun</Text>
              <Text style={styles.subtitle}>Daftar untuk memulai</Text>
            </View>

            <View style={styles.formContainer}>
              <Controller
                control={control}
                name="email"
                render={({
                  field: { value, onChange, onBlur },
                  fieldState: { error },
                }) => (
                  <View style={styles.inputGroup}>
                    <Feather
                      name="mail"
                      size={20}
                      color="#B17457"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="Email"
                      placeholderTextColor="#666"
                      style={[styles.input, error && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      editable={!formState.isSubmitting}
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
                      secureTextEntry
                      autoCapitalize="none"
                      editable={!formState.isSubmitting}
                    />
                  </View>
                )}
              />

              <TouchableOpacity
                style={[
                  styles.button,
                  formState.isSubmitting && styles.buttonDisabled,
                ]}
                onPress={handleSubmit(signUp)}
                disabled={formState.isSubmitting}>
                {formState.isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Daftar</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Sudah punya akun?</Text>
              <Link href="/auth" style={styles.signInLink}>
                <Text style={styles.signInLinkText}>Masuk</Text>
              </Link>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1, // Agar konten dapat digulir
    padding: 16,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    width: "100%",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#424642",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#536162",
    marginBottom: 16,
  },
  form: {
    width: "100%",
    alignItems: "center",
    margin: 20,
  },
  input: {
    width: "80%",
    padding: 12,
    backgroundColor: "transparent",
    fontSize: 16,
    color: "#536162",
  },
  dropdownButtonStyle: {
    width: "80%",
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    marginBottom: 16,
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "normal",
    color: "#536162",
  },
  dropdownButtonIconStyle: {
    fontSize: 20,
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: "#E9ECEF",
    borderRadius: 8,
  },
  dropdownItemStyle: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
    color: "#151E26",
  },
  button: {
    backgroundColor: "#B17457",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signInButton: {
    color: "#B17457",
    fontWeight: "bold",
    fontSize: 16,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 16,
    paddingLeft: 20,
    textAlign: "left",
    width: "90%",
  },
  keyboardView: {
    flex: 1,
    width: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    width: "80%",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  inputIcon: {
    marginRight: 8,
  },
  inputError: {
    borderColor: "red",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  footerText: {
    color: "#536162",
    fontSize: 16,
  },
  signInLink: {
    paddingHorizontal: 4,
  },
  signInLinkText: {
    color: "#B17457",
    fontWeight: "600",
    fontSize: 15,
  },
});
