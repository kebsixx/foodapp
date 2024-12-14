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
import PickerSelect from "react-native-picker-select";
import React from "react";
import AntDesign from "@expo/vector-icons/AntDesign";
import SelectDropdown from "react-native-select-dropdown";

const authSchema = zod.object({
  name: zod.string().min(4, { message: "Name is required" }),
  address: zod.string().min(5, { message: "Address is required" }),
  phone: zod.string().min(10, { message: "Phone is required" }),
  gender: zod.enum(["Male", "Female"]),
  email: zod.string().email({ message: "Invalid email address" }),
  password: zod
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export default function Register() {
  const { session } = useAuth();
  const Toast = useToast();

  if (session) return <Redirect href="/" />;

  const { control, handleSubmit, formState } = useForm<
    zod.infer<typeof authSchema>
  >({
    resolver: zodResolver(authSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      gender: "Male",
      email: "",
      password: "",
    },
  });

  const signUp = async (data: zod.infer<typeof authSchema>) => {
    const { error } = await supabase.auth.signUp(data);

    if (error) {
      alert(error.message);
    } else {
      Toast.show("Selamat datang! Selamat berbelanja!", {
        type: "custom_toast",
        animationDuration: 100,
        data: {
          title: `Sign up successfully 🎉`,
        },
      });
    }
  };

  return (
    <ImageBackground style={styles.backgroundImage}>
      <View style={styles.overlay} />

      <View style={styles.container}>
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>Silahkan buat akun untuk berbelanja</Text>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({
              field: { value, onChange, onBlur },
              fieldState: { error },
            }) => (
              <>
                <TextInput
                  placeholder="Nama"
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
            name="address"
            render={({
              field: { value, onChange, onBlur },
              fieldState: { error },
            }) => (
              <>
                <TextInput
                  placeholder="Alamat"
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
            name="phone"
            render={({
              field: { value, onChange, onBlur },
              fieldState: { error },
            }) => (
              <>
                <TextInput
                  placeholder="No. Handphone"
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
            name="gender"
            render={({ field: { onChange }, fieldState: { error } }) => (
              <>
                <SelectDropdown
                  data={["Laki-laki", "Perempuan"]}
                  onSelect={(selectedItem) => {
                    onChange(selectedItem);
                  }}
                  renderButton={(selectedItem, isOpened) => {
                    return (
                      <View style={styles.dropdownButtonStyle}>
                        <Text style={styles.dropdownButtonTxtStyle}>
                          {selectedItem || "Jenis Kelamin"}
                        </Text>
                        <AntDesign
                          name={isOpened ? "upcircleo" : "circledowno"}
                          size={20}
                          color="#536162"
                        />
                      </View>
                    );
                  }}
                  renderItem={(item) => {
                    return (
                      <View
                        style={{
                          ...styles.dropdownItemStyle,
                        }}>
                        <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
                      </View>
                    );
                  }}
                  showsVerticalScrollIndicator={false}
                  dropdownStyle={styles.dropdownMenuStyle}
                />
                {error && <Text style={styles.error}>{error.message}</Text>}
              </>
            )}
          />

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
    backgroundColor: "#F3F4ED",
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

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "purple",
    borderRadius: 8,
    color: "black",
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
