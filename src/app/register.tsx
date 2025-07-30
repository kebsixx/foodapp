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
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const userSchema = zod.object({
  username: zod
    .string()
    .min(5, "Username minimal 5 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username hanya boleh mengandung huruf, angka, dan underscore"
    )
    .toLowerCase(),

  name: zod
    .string()
    .min(1, "Nama harus diisi")
    .min(2, "Nama minimal 2 karakter")
    .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh mengandung huruf dan spasi"),
  phone: zod
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^[0-9+\-\s()]+$/, "Format nomor telepon tidak valid"),
  address: zod.string().optional(),
  gender: zod.boolean(),
});

export default function Register() {
  const { session, setUser, user } = useAuth();
  const Toast = useToast();
  const router = useRouter();
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      name: "",
      phone: "",
      address: "",
      gender: true,
    },
    mode: "onChange", // Enable real-time validation
  });

  const onSubmit = async (data: zod.infer<typeof userSchema>) => {
    if (!session?.user) return;

    try {
      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("username")
        .eq("username", data.username)
        .single();

      if (existingUser) {
        setError("username", {
          type: "manual",
          message: t("register.usernameExists"),
        });
        return;
      }

      const { error } = await supabase
        .from("users")
        .update({
          username: data.username,
          name: data.name,
          phone: data.phone,
          address: data.address?.trim() ? data.address : null, // pastikan null jika kosong
          gender: data.gender,
        })
        .eq("id", session.user.id);

      if (error) throw error;

      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (fetchError) throw fetchError;

      setUser({
        ...userData,
        avatar_url: null,
      });
      Toast.show(t("register.dataSaved"), {
        type: "custom_toast",
        data: { title: t("common.success") },
      });
      router.push("/");
    } catch (error: any) {
      // Show server errors in the form
      if (error.message?.includes("username")) {
        setError("username", {
          type: "manual",
          message: error.message,
        });
      } else {
        // If we can't determine which field caused the error, show it as a general form error
        setError("root", {
          type: "manual",
          message: error.message || t("register.saveError"),
        });
      }
    }
  };

  useEffect(() => {
    // Handle navigation based on auth state
    if (!session) {
      router.replace("/signup");
    } else if (user?.name) {
      router.replace("/(shop)");
    }
  }, [session, user, router]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("register.completeProfile")}</Text>
            <Text style={styles.subtitle}>
              {t("register.tellAboutYourself")}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="name"
              render={({
                field: { value, onChange },
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
                      placeholder={t("register.name")}
                      placeholderTextColor="#666"
                      style={[styles.input, error && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                  {error && (
                    <Text style={styles.errorText}>
                      {t(`validation.${error.message}`)}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="username"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <View style={styles.inputContainer}>
                  <View
                    style={[
                      styles.inputGroup,
                      error && styles.inputGroupError,
                    ]}>
                    <Feather
                      name="at-sign"
                      size={20}
                      color={error ? "#FF6B6B" : "#B17457"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder={t("register.username")}
                      placeholderTextColor="#666"
                      style={[styles.input, error && styles.inputError]}
                      value={value}
                      onChangeText={(text) => onChange(text.toLowerCase())}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {error && (
                    <Text style={styles.errorText}>
                      {t(`validation.${error.message}`)}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <View style={styles.inputContainer}>
                  <View
                    style={[
                      styles.inputGroup,
                      error && styles.inputGroupError,
                    ]}>
                    <Feather
                      name="phone"
                      size={20}
                      color={error ? "#FF6B6B" : "#B17457"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder={t("register.phoneNumber")}
                      placeholderTextColor="#666"
                      style={[styles.input, error && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      keyboardType="phone-pad"
                    />
                  </View>
                  {error && (
                    <Text style={styles.errorText}>
                      {t(`validation.${error.message}`)}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="address"
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <View style={styles.inputContainer}>
                  <View
                    style={[
                      styles.inputGroup,
                      error && styles.inputGroupError,
                    ]}>
                    <Feather
                      name="map-pin"
                      size={20}
                      color={error ? "#FF6B6B" : "#B17457"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder={t("register.addressOptional")}
                      placeholderTextColor="#666"
                      style={[styles.input, error && styles.inputError]}
                      value={value}
                      onChangeText={onChange}
                      multiline
                    />
                  </View>
                  {error && (
                    <Text style={styles.errorText}>
                      {t(`validation.${error.message}`)}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="gender"
              render={({ field: { value, onChange } }) => (
                <View style={styles.genderContainer}>
                  <TouchableOpacity
                    style={[styles.genderButton, value && styles.genderActive]}
                    onPress={() => onChange(true)}>
                    <Text
                      style={
                        value ? styles.genderActiveText : styles.genderText
                      }>
                      {t("register.male")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.genderButton, !value && styles.genderActive]}
                    onPress={() => onChange(false)}>
                    <Text
                      style={
                        !value ? styles.genderActiveText : styles.genderText
                      }>
                      {t("register.female")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            {errors.root && (
              <Text
                style={[
                  styles.errorText,
                  { textAlign: "center", marginLeft: 0, marginBottom: 8 },
                ]}>
                {errors.root.message}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {t("register.saveProfile")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    width: "100%",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#424642",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#536162",
    marginBottom: 16,
    textAlign: "center",
    marginHorizontal: 20,
  },
  form: {
    width: "100%",
    alignItems: "center",
    margin: 20,
  },
  input: {
    width: "100%",
    padding: 12,
    backgroundColor: "transparent",
    fontSize: 16,
    color: "#536162",
  },
  inputError: {
    color: "#FF6B6B",
  },
  // New styles for error handling
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "#B17457",
    paddingVertical: 8,
  },
  inputGroupError: {
    backgroundColor: "#FFF0F0",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 28, // Align with input text (icon width + margin)
    fontWeight: "400",
  },
  dropdownButtonStyle: {
    width: "100%",
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
    marginTop: 24,
    width: "100%",
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
    width: "100%",
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    width: "100%",
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    marginHorizontal: 4,
  },
  genderActive: {
    borderColor: "#B17457",
    backgroundColor: "#f8f1ee",
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
    width: "100%",
  },
  formContainer: {
    width: "90%",
    alignItems: "center",
  },

  inputIcon: {
    marginRight: 12,
    minWidth: 20,
  },

  buttonDisabled: {
    backgroundColor: "#B17457",
    opacity: 0.5,
  },
  genderText: {
    fontSize: 14,
    color: "#666",
  },
  genderActiveText: {
    fontSize: 14,
    color: "#B17457",
    fontWeight: "600",
  },
});
