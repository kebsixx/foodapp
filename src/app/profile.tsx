import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import React, { useState, useEffect } from "react";

import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../providers/auth-provider";
import { useToast } from "react-native-toast-notifications";
import { supabase } from "../lib/supabase";
import { useRouter, Stack } from "expo-router";
import Constants from "expo-constants";

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  showBorder?: boolean;
}

export default function Profile() {
  const { session, user, updateProfile } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isContactLoading, setIsContactLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    address: user?.address || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });

  // Edit mode states
  const [editingField, setEditingField] = useState<string | null>(null);

  // Temporary values for editing
  const [tempValue, setTempValue] = useState("");

  const Toast = useToast();

  // Get app version from app.json via Constants
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  useEffect(() => {
    if (!session) {
      router.replace("/auth");
      return;
    }
    if (!user?.name) {
      router.replace("/register");
      return;
    }
  }, [session, user]);

  // Start editing a field
  const startEditing = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingField(null);
  };

  // Save changes for any field
  const saveChanges = async () => {
    if (!user?.id || !editingField) return;

    try {
      setIsLoading(true);

      // Handle email separately
      if (editingField === "email") {
        await handleEmailUpdate();
        return;
      }

      // Validate username if editing username
      if (editingField === "username") {
        // Validate username format
        if (!tempValue.match(/^[a-zA-Z0-9_]+$/)) {
          throw new Error(
            "Username hanya boleh mengandung huruf, angka, dan underscore"
          );
        }

        // Check if username exists (excluding current user)
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("username")
          .eq("username", tempValue)
          .neq("id", user.id)
          .single();

        if (existingUser) {
          throw new Error("Username sudah digunakan");
        }
      }

      // Update the field in Supabase
      const { error } = await supabase
        .from("users")
        .update({ [editingField]: tempValue })
        .eq("id", user.id);

      if (error) throw error;

      // Update local state
      setFormData((prev) => ({ ...prev, [editingField]: tempValue }));
      updateProfile({ [editingField]: tempValue });

      // Show success message
      Toast.show(
        `${
          editingField.charAt(0).toUpperCase() + editingField.slice(1)
        } updated successfully`,
        {
          type: "custom_toast",
          data: { title: "Success" },
        }
      );

      // Exit edit mode
      setEditingField(null);
    } catch (error) {
      Toast.show(error instanceof Error ? error.message : "An error occurred", {
        type: "custom_toast",
        data: { title: "Error" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailUpdate = async () => {
    try {
      // Validate email format first
      if (!tempValue.includes("@") || !tempValue.includes(".")) {
        throw new Error("Please enter a valid email address");
      }

      // Check if email is actually changing
      if (tempValue === user?.email) {
        setEditingField(null);
        return;
      }

      const { error } = await supabase.auth.updateUser(
        { email: tempValue },
        {
          // This will redirect after email confirmation
          emailRedirectTo: "ceritasenja://email-confirmation",
        }
      );

      if (error) throw error;

      Toast.show("Verification email sent. Please check your inbox.", {
        type: "custom_toast",
        data: { title: "Email Verification" },
        duration: 4000,
      });

      setEditingField(null);
    } catch (error) {
      console.error("Email update error:", error);

      let errorMessage = "Failed to update email";
      if (error instanceof Error) {
        errorMessage = error.message.includes("already in use")
          ? "This email is already registered"
          : error.message;
      }

      Toast.show(errorMessage, {
        type: "custom_toast",
        data: { title: "Error" },
        duration: 3000,
      });
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSignOutLoading(true);
      await supabase.auth.signOut();
      router.replace("/auth");
    } catch (error) {
      Toast.show("Failed to sign out", {
        type: "custom_toast",
        data: { title: "Error" },
      });
    } finally {
      setIsSignOutLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleteLoading(true);
      // You can add confirmation dialog here if needed
      router.push("https://ceritasenjacafe.com/user/delete");
    } catch (error) {
      Toast.show("Failed to navigate to delete page", {
        type: "custom_toast",
        data: { title: "Error" },
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleContactUs = async () => {
    try {
      setIsContactLoading(true);
      await Linking.openURL("https://ceritasenjacafe.com/#contact");
    } catch (error) {
      Toast.show("Failed to open contact page", {
        type: "custom_toast",
        data: { title: "Error" },
      });
    } finally {
      setIsContactLoading(false);
    }
  };

  // Settings handlers
  const openTermsOfUse = () => {
    Linking.openURL("https://ceritasenjacafe.com/user/terms-of-use");
  };

  const openPrivacyPolicy = () => {
    Linking.openURL("https://ceritasenjacafe.com/user/policy");
  };

  const SettingsItem = ({
    icon,
    title,
    onPress,
    showBorder = true,
  }: SettingsItemProps) => (
    <TouchableOpacity
      style={[styles.settingsItem, showBorder && styles.settingsItemBorder]}
      onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        {icon}
        <Text style={styles.settingsItemText}>{title}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );

  // Render an editable field
  const renderField = (
    label: string,
    field: string,
    value: string,
    keyboardType: string = "default",
    multiline: boolean = false
  ) => {
    const isEditing = editingField === field;

    return (
      <View style={styles.infoItem}>
        <Text style={styles.label}>{label}</Text>

        {isEditing ? (
          <View style={styles.editFieldContainer}>
            <TextInput
              style={[
                styles.editInput,
                multiline && { height: 80, textAlignVertical: "top" },
              ]}
              value={tempValue}
              onChangeText={setTempValue}
              keyboardType={keyboardType as any}
              autoCapitalize={
                field === "email" || field === "username" ? "none" : "sentences"
              }
              multiline={multiline}
              autoCorrect={false}
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.editActionButton}
                onPress={cancelEditing}
                disabled={isLoading}>
                <MaterialIcons name="close" size={22} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editActionButton}
                onPress={saveChanges}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#B17457" />
                ) : (
                  <MaterialIcons name="check" size={22} color="#B17457" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.fieldValueContainer}>
            <Text style={styles.text}>{value || "Not set"}</Text>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={() => startEditing(field, value)}>
              <FontAwesome name="pencil" size={16} color="#B17457" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Profile",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#B17457",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerShadowVisible: false, // Removes the bottom border
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <FontAwesome name="user-o" size={72} color="#fff" />
          </View>
          <Text style={styles.userName}>{formData.name}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.info}>
            <Text style={styles.sectionTitle}>User Information</Text>
            {renderField("Name", "name", formData.name)}
            {renderField("Username", "username", formData.username)}
            {renderField("Email", "email", user?.email || "")}
            {renderField("Phone", "phone", formData.phone, "phone-pad")}
            {renderField(
              "Address",
              "address",
              formData.address,
              "default",
              true
            )}
          </View>

          {/* Settings Section */}
          <View style={styles.settingsContainer}>
            <Text style={styles.settingsTitle}>Settings</Text>

            <SettingsItem
              icon={
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color="#555"
                  style={styles.settingsIcon}
                />
              }
              title="Terms of Use"
              onPress={openTermsOfUse}
            />

            <SettingsItem
              icon={
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color="#555"
                  style={styles.settingsIcon}
                />
              }
              title="Privacy Policy"
              onPress={openPrivacyPolicy}
              showBorder={false}
            />
          </View>

          {/* Contact Us Button */}
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactUs}>
            {isContactLoading ? (
              <ActivityIndicator color="#B17457" />
            ) : (
              <>
                <Ionicons name="mail-outline" size={22} color="#B17457" />
                <Text style={styles.contactButtonText}>Contact Us</Text>
              </>
            )}
          </TouchableOpacity>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>App Version {appVersion}</Text>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}>
            {isSignOutLoading ? (
              <ActivityIndicator color="#ff4444" />
            ) : (
              <>
                <Text style={styles.signOutText}>Sign Out</Text>
                <FontAwesome
                  name="sign-out"
                  size={24}
                  style={styles.signOutIcon}
                />
              </>
            )}
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity
            style={[
              styles.signOutButton,
              { backgroundColor: "#f5f5f5", justifyContent: "center" },
            ]}
            onPress={handleDeleteAccount}>
            {isDeleteLoading ? (
              <ActivityIndicator color="#d32f2f" />
            ) : (
              <>
                <Text style={[styles.signOutText, { color: "#d32f2f" }]}>
                  Delete Account
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

// Update styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#B17457",
    padding: 20,
    paddingTop: 40,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#eee",
  },
  button: {
    flex: 1,
    backgroundColor: "#B17457",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#B17457",
    gap: 4,
  },
  editButtonText: {
    color: "#B17457",
    fontSize: 14,
    fontWeight: "500",
  },
  editIcon: {
    color: "#B17457",
  },
  errorInput: {
    borderColor: "#ff4444",
    borderWidth: 1,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  signOutButton: {
    backgroundColor: "#ffe1e1",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signOutText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "600",
  },
  signOutIcon: {
    color: "#ff4444",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  info: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 12,
  },
  text: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderColor: "#B17457",
    borderWidth: 1,
  },
  cancelButtonText: {
    color: "#B17457",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  verificationText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  // New styles for settings section
  settingsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  settingsItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsIcon: {
    marginRight: 12,
  },
  settingsItemText: {
    fontSize: 16,
    color: "#333",
  },
  // New styles for inline editing
  fieldValueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  editIconButton: {
    padding: 8,
  },
  editFieldContainer: {
    marginTop: 4,
  },
  editInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  editActionButton: {
    padding: 8,
    marginLeft: 8,
  },
  // Contact Us button styles
  contactButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactButtonText: {
    color: "#B17457",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  // Version container styles
  versionContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  versionText: {
    color: "#888",
    fontSize: 14,
  },
});
