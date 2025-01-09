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
import { Redirect, useRouter } from "expo-router";
import React from "react";
import { ScrollView } from "react-native";

const userSchema = zod.object({
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
      name: "",
      phone: "",
      address: "",
      gender: true,
    },
  });

  const onSubmit = async (data: zod.infer<typeof userSchema>) => {
    if (!session?.user) return;

    const { error } = await supabase
      .from("users")
      .update({
        name: data.name,
        phone: data.phone,
        address: data.address,
        gender: data.gender,
      })
      .eq("id", session.user.id);

    if (error) {
      Toast.show("Gagal menyimpan data", {
        type: "custom_toast",
        data: { title: "Error" },
      });
    } else {
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setUser(userData);
      Toast.show("Data berhasil disimpan", {
        type: "custom_toast",
        data: { title: "Sukses" },
      });
      router.push("/");
    }
  };

  if (!session) {
    return <Redirect href="/signup" />;
  }

  if (user?.name) {
    return <Redirect href="/" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.title}>Lengkapi Data</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <>
                <TextInput
                  placeholder="Nama Lengkap"
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                />
                {error && <Text style={styles.error}>{error.message}</Text>}
              </>
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <>
                <TextInput
                  placeholder="Nomor Telepon"
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                />
                {error && <Text style={styles.error}>{error.message}</Text>}
              </>
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field: { value, onChange } }) => (
              <TextInput
                placeholder="Alamat (Opsional)"
                style={styles.input}
                value={value}
                onChangeText={onChange}
                multiline
              />
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
                  <Text>Laki-laki</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, !value && styles.genderActive]}
                  onPress={() => onChange(false)}>
                  <Text>Perempuan</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          disabled={formState.isSubmitting}>
          <Text style={styles.buttonText}>Simpan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
});
