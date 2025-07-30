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
import { Link, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const authSchema = zod.object({
  login: zod.string().min(1, { message: "Email atau username wajib diisi" }),
  password: zod.string().min(6, { message: "Password minimal 6 karakter" }),
});

export default function Auth() {
  const { session, user } = useAuth();
  const Toast = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [secureEntry, setSecureEntry] = useState(true);
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    ...restForm
  } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });

  // Move redirect logic into useEffect
  useEffect(() => {
    if (session && user) {
      if (user.name) {
        router.replace("/(shop)");
      }
    }
  }, [session, user]);

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
          setError("login", {
            type: "manual",
            message: "Username tidak ditemukan",
          });
          return;
        }
        emailToUse = userData.email;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: data.password,
      });

      if (error) {
        if (
          error.message?.toLowerCase().includes("invalid login credentials")
        ) {
          setError("password", {
            type: "manual",
            message: "Password salah",
          });
          return;
        }
        throw error;
      }

      Toast.show("🎉 Anda berhasil masuk", {
        type: "custom_toast",
        duration: 2000,
        data: {
          title: "Selamat Datang Kembali!",
        },
      });
    } catch (error: any) {
      // If we can't determine which field caused the error, show it as a root error
      setError("root", {
        type: "manual",
        message: error.message || "Login Gagal",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove early returns and render conditionally
  return (
    <SafeAreaView style={styles.container}>
      {!session ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <Text style={styles.title}>{t("auth.welcomeBack")}</Text>
              </View>
              <Text style={styles.subtitle}>{t("auth.signInContinue")}</Text>
            </View>

            <View style={styles.formContainer}>
              <Controller
                control={control}
                name="login"
                render={({
                  field: { value, onChange, onBlur },
                  fieldState: { error },
                }) => (
                  <View style={styles.inputContainer}>
                    <View
                      style={[
                        styles.inputGroup,
                        error && styles.inputGroupError,
                      ]}>
                      <Feather
                        name="user"
                        size={20}
                        color={error ? "#FF6B6B" : "#B17457"}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder={
                          t("auth.email") + " / " + t("auth.username")
                        }
                        placeholderTextColor="#666"
                        style={[styles.input, error && styles.inputError]}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="none"
                        editable={!isLoading}
                      />
                    </View>
                    {error && (
                      <Text style={styles.errorText}>
                        <Feather
                          name="alert-circle"
                          size={12}
                          color="#FF6B6B"
                          style={styles.errorIcon}
                        />{" "}
                        {error.message}
                      </Text>
                    )}
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
                  <View style={styles.inputContainer}>
                    <View
                      style={[
                        styles.inputGroup,
                        error && styles.inputGroupError,
                      ]}>
                      <Feather
                        name="lock"
                        size={20}
                        color={error ? "#FF6B6B" : "#B17457"}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        placeholder={t("auth.password")}
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
                          color={error ? "#FF6B6B" : "#666"}
                        />
                      </TouchableOpacity>
                    </View>
                    {error && (
                      <Text style={styles.errorText}>
                        <Feather
                          name="alert-circle"
                          size={12}
                          color="#FF6B6B"
                          style={styles.errorIcon}
                        />{" "}
                        {error.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              {errors.root && (
                <View style={styles.rootErrorContainer}>
                  <Text style={[styles.errorText, { marginLeft: 0 }]}>
                    <Feather
                      name="alert-triangle"
                      size={12}
                      color="#FF6B6B"
                      style={styles.errorIcon}
                    />{" "}
                    {errors.root.message}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit(signIn)}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>{t("auth.login")}</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{t("auth.noAccount")}</Text>
              <Link href="/signup" style={styles.signUpLink}>
                <Text style={styles.signUpLinkText}>{t("auth.createOne")}</Text>
              </Link>
            </View>
          </View>
        </KeyboardAvoidingView>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  inputGroupError: {
    backgroundColor: "#FFF0F0",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
    width: "100%",
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginHorizontal: 20,
  },
  formContainer: {
    marginBottom: 24,
    width: "100%",
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
    minWidth: 20,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: "#333",
  },
  inputError: {
    color: "#FF6B6B",
  },
  eyeIcon: {
    padding: 8,
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
    flexWrap: "wrap",
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
    fontSize: 15,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  errorIcon: {
    marginRight: 4,
  },
  rootErrorContainer: {
    backgroundColor: "#FFE5E5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
  },
});
