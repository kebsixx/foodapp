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
import { Redirect, useRouter } from "expo-router";
import React from "react";
import { Feather } from "@expo/vector-icons";

const userSchema = zod.object({
  username: zod
    .string()
    .min(5, "Username minimal 5 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh mengandung huruf dan spasi")
    .toLowerCase(),
  name: zod.string().min(1, "Nama harus diisi"),
  phone: zod.string().min(10, "Nomor telepon tidak valid"),
  address: zod.string().optional(),
  gender: zod.boolean(),
});

export default function Register() {
  const { session, setUser, user } = useAuth();
  const Toast = useToast();
  const router = useRouter();

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      name: "",
      phone: "",
      address: "",
      gender: true,
    },
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
        Toast.show("Username sudah digunakan", {
          type: "custom_toast",
          data: { title: "Error" },
        });
        return;
      }

      const { error } = await supabase
        .from("users")
        .update({
          username: data.username,
          name: data.name,
          phone: data.phone,
          address: data.address,
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

      setUser(userData);
      Toast.show("Data berhasil disimpan", {
        type: "custom_toast",
        data: { title: "Sukses" },
      });
      router.push("/");
    } catch (error) {
      Toast.show("Gagal menyimpan data", {
        type: "custom_toast",
        data: { title: "Error" },
      });
    }
  };

  if (!session) {
    return <Redirect href="/signup" />;
  }

  if (user?.name) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Complete Profile</Text>
            <Text style={styles.subtitle}>Tell us about yourself</Text>
          </View>

          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="name"
              render={({
                field: { value, onChange },
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
                    placeholder="Full Name"
                    placeholderTextColor="#666"
                    style={[styles.input, error && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                  />
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
                <View style={styles.inputGroup}>
                  <Feather
                    name="at-sign"
                    size={20}
                    color="#B17457"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Username"
                    placeholderTextColor="#666"
                    style={[styles.input, error && styles.inputError]}
                    value={value}
                    onChangeText={(text) => onChange(text.toLowerCase())}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
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
                <View style={styles.inputGroup}>
                  <Feather
                    name="phone"
                    size={20}
                    color="#B17457"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Phone Number"
                    placeholderTextColor="#666"
                    style={[styles.input, error && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="address"
              render={({ field: { value, onChange } }) => (
                <View style={styles.inputGroup}>
                  <Feather
                    name="map-pin"
                    size={20}
                    color="#B17457"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Address (Optional)"
                    placeholderTextColor="#666"
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    multiline
                  />
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
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.genderButton, !value && styles.genderActive]}
                    onPress={() => onChange(false)}>
                    <Text
                      style={
                        !value ? styles.genderActiveText : styles.genderText
                      }>
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            <TouchableOpacity
              style={[
                styles.button,
                formState.isSubmitting && styles.buttonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={formState.isSubmitting}>
              {formState.isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save Profile</Text>
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
    flexGrow: 1, // Agar konten dapat digulir
    padding: 16,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    width: "100%",
  },
  title: {
    fontSize: 45,
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
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
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
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 16,
  },
  genderButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#B17457",
    width: "48%",
    alignItems: "center",
  },
  genderActive: {
    backgroundColor: "#B17457",
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
    borderColor: "#B17457",
  },
  inputIcon: {
    marginRight: 8,
  },
  inputError: {
    borderColor: "red",
  },
  buttonDisabled: {
    backgroundColor: "#B17457",
    opacity: 0.5,
  },
  genderText: {
    color: "#B17457",
    fontSize: 16,
    fontWeight: "500",
  },
  genderActiveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
