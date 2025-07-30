import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Image,
  Modal,
} from "react-native";
import React, { useState, useEffect } from "react";

import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../providers/auth-provider";
import { useToast } from "react-native-toast-notifications";
import { supabase } from "../lib/supabase";
import { useRouter, Stack } from "expo-router";
import Constants from "expo-constants";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/language-switcher";

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
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);
  const { t } = useTranslation();

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
        } berhasil diperbarui`,
        {
          type: "custom_toast",
          data: { title: "Berhasil" },
        }
      );

      // Exit edit mode
      setEditingField(null);
    } catch (error) {
      Toast.show(error instanceof Error ? error.message : "Terjadi kesalahan", {
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
        throw new Error("Masukkan alamat email yang valid");
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

      Toast.show(
        "Email verifikasi telah dikirim. Silakan periksa kotak masuk Anda.",
        {
          type: "custom_toast",
          data: { title: "Verifikasi Email" },
          duration: 4000,
        }
      );

      setEditingField(null);
    } catch (error) {
      console.error("Email update error:", error);

      let errorMessage = "Gagal memperbarui email";
      if (error instanceof Error) {
        errorMessage = error.message.includes("already in use")
          ? "Email ini sudah terdaftar"
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
      Toast.show("Gagal keluar", {
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
      Toast.show("Gagal membuka halaman hapus akun", {
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
      Toast.show("Gagal membuka halaman kontak", {
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

  const openRefundPolicy = () => {
    setShowRefundPolicy(true);
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

  // Refund Policy Modal
  const RefundPolicyModal = () => (
    <Modal
      visible={showRefundPolicy}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowRefundPolicy(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.refundPolicyContainer}>
          <View style={styles.refundPolicyHeader}>
            <Text style={styles.refundPolicyTitle}>
              {t("refundPolicy.title")}
            </Text>
            <TouchableOpacity
              onPress={() => setShowRefundPolicy(false)}
              style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.refundPolicyContent}>
            <Text style={styles.refundPolicySubtitle}>
              {t("refundPolicy.subtitle")}
            </Text>
            <Text style={styles.refundPolicyDate}>
              {t("refundPolicy.effectiveDate")}{" "}
              {appVersion.includes("1.0") ? "1 Juni 2025" : "1 Januari 2025"}
            </Text>

            <Text style={styles.refundPolicyText}>
              {t("refundPolicy.introduction")}
            </Text>

            <Text style={styles.refundPolicySectionTitle}>
              {t("refundPolicy.eligibleConditionsTitle")}
            </Text>
            <Text style={styles.refundPolicyText}>
              {t("refundPolicy.eligibleConditionsIntro")}
            </Text>
            <Text style={styles.refundPolicyItem}>
              {t("refundPolicy.cancelledByCafe")}
            </Text>
            <Text style={styles.refundPolicyItem}>
              {t("refundPolicy.wrongOrIncomplete")}
            </Text>
            <Text style={styles.refundPolicyItem}>
              {t("refundPolicy.poorQuality")}
            </Text>

            <Text style={styles.refundPolicySectionTitle}>
              {t("refundPolicy.nonEligibleTitle")}
            </Text>
            <Text style={styles.refundPolicyText}>
              {t("refundPolicy.nonEligibleIntro")}
            </Text>
            <Text style={styles.refundPolicyItem}>
              {t("refundPolicy.changeOfMind")}
            </Text>
            <Text style={styles.refundPolicyItem}>
              {t("refundPolicy.thirdPartyDelivery")}
            </Text>
            <Text style={styles.refundPolicyItem}>
              {t("refundPolicy.notPickedUp")}
            </Text>

            <Text style={styles.refundPolicySectionTitle}>
              {t("refundPolicy.refundProcessTitle")}
            </Text>
            <Text style={styles.refundPolicyItem}>
              {t("refundPolicy.contactUs")}
            </Text>
            <Text style={styles.refundPolicyItem}>
              {t("refundPolicy.provideEvidence")}
            </Text>
            <Text style={styles.refundPolicyItem}>
              {t("refundPolicy.verification")}
            </Text>
            <Text style={styles.refundPolicyItem}>
              {t("refundPolicy.refundProcess")}
            </Text>

            <Text style={styles.refundPolicySectionTitle}>
              {t("refundPolicy.contactTitle")}
            </Text>
            <Text style={styles.refundPolicyText}>
              {t("refundPolicy.contactInfo")}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: t("profile.title"),
          headerShown: true,
          headerStyle: {
            backgroundColor: "#B17457",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerTitleAlign: "center",
          headerShadowVisible: false, // Removes the bottom border
        }}
      />

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  user?.avatar_url ||
                  "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png",
              }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userName}>{formData.name}</Text>
          <Text style={styles.userUsername}>
            @{formData.username || "username"}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.info}>
            <Text style={styles.sectionTitle}>{t("profile.userInfo")}</Text>
            {renderField(t("profile.name"), "name", formData.name)}
            {renderField("Username", "username", formData.username)}
            {renderField("Email", "email", user?.email || "")}
            {renderField(
              t("profile.phone"),
              "phone",
              formData.phone,
              "phone-pad"
            )}
            {renderField(
              t("profile.address"),
              "address",
              formData.address,
              "default",
              true
            )}
          </View>

          {/* Settings Section */}
          <View style={styles.settingsContainer}>
            <Text style={styles.settingsTitle}>{t("profile.settings")}</Text>

            <SettingsItem
              icon={
                <Ionicons
                  name="document-text-outline"
                  size={22}
                  color="#555"
                  style={styles.settingsIcon}
                />
              }
              title={t("profile.termsOfUse")}
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
              title={t("profile.privacyPolicy")}
              onPress={openPrivacyPolicy}
            />

            <SettingsItem
              icon={
                <MaterialIcons
                  name="monetization-on"
                  size={22}
                  color="#555"
                  style={styles.settingsIcon}
                />
              }
              title={t("profile.refundPolicy")}
              onPress={openRefundPolicy}
              showBorder={false}
            />
          </View>

          {/* Language Section */}
          <View style={styles.settingsContainer}>
            <Text style={styles.settingsTitle}>{t("language.title")}</Text>
            <LanguageSwitcher />
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
                <Text style={styles.contactButtonText}>
                  {t("profile.contactUs")}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>
              {t("profile.appVersion")} {appVersion}
            </Text>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}>
            {isSignOutLoading ? (
              <ActivityIndicator color="#ff4444" />
            ) : (
              <>
                <Text style={styles.signOutText}>{t("auth.logout")}</Text>
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
                  {t("profile.deleteAccount")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Render Refund Policy Modal */}
      <RefundPolicyModal />
    </>
  );
}

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
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
  },
  userName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  userUsername: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.8,
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
  // Styles for settings section
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
  // Styles for inline editing
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
  // Refund Policy Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  refundPolicyContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "90%",
    maxHeight: "80%",
    padding: 0,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  refundPolicyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  refundPolicyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  refundPolicyContent: {
    padding: 16,
    maxHeight: "100%",
  },
  refundPolicySubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#B17457",
    marginBottom: 8,
  },
  refundPolicyDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    fontStyle: "italic",
  },
  refundPolicyText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 16,
    lineHeight: 20,
  },
  refundPolicySectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
    marginBottom: 8,
  },
  refundPolicyItem: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    paddingLeft: 8,
    lineHeight: 20,
  },
});
