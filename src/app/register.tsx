import {
  View,
  Text,
  StyleSheet,
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
import { ScrollView } from "react-native";

export const authSchema = zod.object({
  email: zod.string().email(),
  password: zod.string().min(6, { message: "Password minimal 6 karakter" }),
});

export default function Register() {
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

  const signUp = async (data: zod.infer<typeof authSchema>) => {
    const { error } = await supabase.auth.signUp(data);

    if (error) {
      console.error(error); // Log any unexpected errors
      // Display a toast message with a generic error message
      Toast.show("Terjadi kesalahan saat signup", {
        type: "custom_toast",
        animationDuration: 100,
        data: {
          title: `Error `,
        },
      });
    } else {
      Toast.show("Selamat datang! Selamat berbelanja!", {
        type: "custom_toast",
        animationDuration: 100,
        data: {
          title: `Sign up successfully `,
        },
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.backgroundImage}>
        <View style={styles.container}>
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>
            Silahkan buat akun untuk berbelanja
          </Text>

          <View style={styles.form}>
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
                    placeholderTextColor="#536162"
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
                    placeholderTextColor="#536162"
                    autoCapitalize="none"
                    editable={!formState.isSubmitting}
                  />
                  {error && <Text style={styles.error}>{error.message}</Text>}
                </>
              )}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit(signUp)}
            disabled={formState.isSubmitting}>
            <Text style={styles.buttonText}>Sign Up</Text>
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
          <Text style={{ color: "#536162", fontSize: 16 }}>
            Sudah punya Akun?
          </Text>
          <Link href="/auth">
            <Text style={styles.signInButton}>Sign In</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
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
    marginBottom: 16,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
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
});
