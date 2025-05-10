import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { useAuth } from "../providers/auth-provider";
import { useToast } from "react-native-toast-notifications";
import { supabase } from "../lib/supabase";

interface EditModalProps {
  title: string;
  value: string;
  onChangeText: (text: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  [key: string]: any;
}

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    address: user?.address || "",
    phone: user?.phone || "",
  });

  // Separate edit states for each field
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [isAddressEditing, setIsAddressEditing] = useState(false);
  const [isPhoneEditing, setIsPhoneEditing] = useState(false);

  // Temporary values for editing
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [newName, setNewName] = useState(formData.name);
  const [newAddress, setNewAddress] = useState(formData.address);
  const [newPhone, setNewPhone] = useState(formData.phone);

  const Toast = useToast();

  // Update handlers for each field
  const handleNameUpdate = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("users")
        .update({ name: newName })
        .eq("id", user?.id);

      if (error) throw error;

      setFormData((prev) => ({ ...prev, name: newName }));
      updateProfile({ name: newName });
      setIsNameEditing(false);
      Toast.show("Name updated successfully", {
        type: "custom_toast",
        data: { title: "Success" },
      });
    } catch (error) {
      Toast.show("Failed to update name", {
        type: "custom_toast",
        data: { title: "Error" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressUpdate = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("users")
        .update({ address: newAddress })
        .eq("id", user?.id);

      if (error) throw error;

      setFormData((prev) => ({ ...prev, address: newAddress }));
      updateProfile({ address: newAddress });
      setIsAddressEditing(false);
      Toast.show("Address updated successfully", {
        type: "custom_toast",
        data: { title: "Success" },
      });
    } catch (error) {
      Toast.show("Failed to update address", {
        type: "custom_toast",
        data: { title: "Error" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneUpdate = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("users")
        .update({ phone: newPhone })
        .eq("id", user?.id);

      if (error) throw error;

      setFormData((prev) => ({ ...prev, phone: newPhone }));
      updateProfile({ phone: newPhone });
      setIsPhoneEditing(false);
      Toast.show("Phone number updated successfully", {
        type: "custom_toast",
        data: { title: "Success" },
      });
    } catch (error) {
      Toast.show("Failed to update phone number", {
        type: "custom_toast",
        data: { title: "Error" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailUpdate = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) throw error;

      setIsEmailEditing(false);
      Toast.show("Email update instructions sent to your inbox", {
        type: "custom_toast",
        data: { title: "Success" },
      });
    } catch (error) {
      Toast.show("Failed to update email", {
        type: "custom_toast",
        data: { title: "Error" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <FontAwesome name="user-o" size={72} color="#fff" />
        </View>
        <Text style={styles.userName}>{formData.name}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.info}>
          {/* Name Section */}
          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <View>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.text}>{formData.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setNewName(formData.name);
                  setIsNameEditing(true);
                }}>
                <FontAwesome name="edit" size={16} color="#B17457" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Email Section */}
          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <View>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.text}>{user?.email}</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setNewEmail(user?.email || "");
                  setIsEmailEditing(true);
                }}>
                <FontAwesome name="envelope" size={16} color="#B17457" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Address Section */}
          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <View>
                <Text style={styles.label}>Address</Text>
                <Text style={styles.text}>{formData.address}</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setNewAddress(formData.address);
                  setIsAddressEditing(true);
                }}>
                <FontAwesome name="edit" size={16} color="#B17457" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Phone Section */}
          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <View>
                <Text style={styles.label}>Phone</Text>
                <Text style={styles.text}>{formData.phone}</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setNewPhone(formData.phone);
                  setIsPhoneEditing(true);
                }}>
                <FontAwesome name="phone" size={16} color="#B17457" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Edit Modals */}
        {isNameEditing && (
          <EditModal
            title="Edit Name"
            value={newName}
            onChangeText={setNewName}
            onSave={handleNameUpdate}
            onCancel={() => setIsNameEditing(false)}
            isLoading={isLoading}
          />
        )}

        {isEmailEditing && (
          <EditModal
            title="Update Email"
            value={newEmail}
            onChangeText={setNewEmail}
            onSave={handleEmailUpdate}
            onCancel={() => setIsEmailEditing(false)}
            isLoading={isLoading}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}

        {isAddressEditing && (
          <EditModal
            title="Edit Address"
            value={newAddress}
            onChangeText={setNewAddress}
            onSave={handleAddressUpdate}
            onCancel={() => setIsAddressEditing(false)}
            isLoading={isLoading}
            multiline
          />
        )}

        {isPhoneEditing && (
          <EditModal
            title="Edit Phone"
            value={newPhone}
            onChangeText={setNewPhone}
            onSave={handlePhoneUpdate}
            onCancel={() => setIsPhoneEditing(false)}
            isLoading={isLoading}
            keyboardType="phone-pad"
          />
        )}

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={async () => {
            try {
              setIsLoading(true);
              await supabase.auth.signOut();
            } catch (error) {
              Toast.show("Failed to sign out", {
                type: "custom_toast",
                data: { title: "Error" },
              });
            } finally {
              setIsLoading(false);
            }
          }}>
          {isLoading ? (
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
      </View>
    </ScrollView>
  );
};

const EditModal = ({
  title,
  value,
  onChangeText,
  onSave,
  onCancel,
  isLoading,
  ...inputProps
}: EditModalProps) => {
  return (
    <View style={styles.editModal}>
      <Text style={styles.modalTitle}>{title}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#888"
        {...inputProps}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={isLoading}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={onSave}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  userEmail: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
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
  errorText: {
    color: "#ff4444",
    fontSize: 14,
    marginTop: 4,
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
});

export default Profile;
