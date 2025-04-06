import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useAuth } from "../providers/auth-provider";
import { useToast } from "react-native-toast-notifications";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";
import { decode } from "base64-arraybuffer";

const DEFAULT_AVATAR =
  "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: user?.address || "",
    phone: user?.phone || "",
    avatar_url: user?.avatar_url || DEFAULT_AVATAR,
  });
  const [newAvatarBase64, setNewAvatarBase64] = useState<string | null>(null);

  const Toast = useToast();

  // Add a loading state for when user is not yet available
  if (!user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#B17457" />
      </View>
    );
  }

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setFormData((prev) => ({
          ...prev,
          avatar_url: result.assets[0].uri,
        }));
        setNewAvatarBase64(result.assets[0].base64);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Toast.show("Failed to pick image", {
        type: "custom_toast",
        data: {
          title: "Fail",
        },
      });
    }
  };

  const uploadAvatar = async (base64Image: string) => {
    try {
      const fileName = `${user.id}-${Date.now()}.jpg`;

      // Delete old avatar if it exists and isn't the default
      if (formData.avatar_url && !formData.avatar_url.includes("pixabay")) {
        try {
          // Extract just the filename from the full URL
          const oldFileName = formData.avatar_url.split("/").pop();
          if (oldFileName) {
            await supabase.storage.from("avatars").remove([oldFileName]); // Remove folder structure from path
          }
        } catch (error) {
          console.warn("Failed to delete old avatar:", error);
        }
      }

      // Upload new avatar without folder structure
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, decode(base64Image), {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) throw error;

      // Get public URL - make sure to use the correct path
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName); // Use just the filename

      console.log("Uploaded avatar URL:", publicUrl); // Add this for debugging
      return publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error; // Let the caller handle the error
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      let finalAvatarUrl = formData.avatar_url;

      if (newAvatarBase64) {
        try {
          const uploadedUrl = await uploadAvatar(newAvatarBase64);
          finalAvatarUrl = uploadedUrl;
        } catch (error) {
          console.error("Avatar upload failed:", error);
          Toast.show("Failed to upload avatar", {
            type: "custom_toast",
            data: {
              title: "Fail",
            },
          });
          // Keep existing avatar if upload fails
          finalAvatarUrl = formData.avatar_url || DEFAULT_AVATAR;
        }
      }

      // Update user profile in database
      const { error: updateError } = await supabase
        .from("users")
        .update({
          ...formData,
          avatar_url: finalAvatarUrl,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update local state and auth context
      const updatedData = {
        ...formData,
        avatar_url: finalAvatarUrl,
      };

      setFormData(updatedData);
      updateProfile(updatedData);
      setNewAvatarBase64(null);
      setIsEditing(false);

      Toast.show("Profile updated successfully", {
        type: "custom_toast",
        data: {
          title: "Success",
        },
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      Toast.show("Failed to update profile", {
        type: "custom_toast",
        data: {
          title: "Fail",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <Image
            source={{ uri: formData.avatar_url || DEFAULT_AVATAR }}
            style={styles.avatar}
            onError={() => {
              setFormData((prev) => ({
                ...prev,
                avatar_url: DEFAULT_AVATAR,
              }));
            }}
          />
          {isEditing && (
            <View style={styles.editOverlay}>
              <Text style={styles.editText}>Change Photo</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.userName}>{formData.name}</Text>
      </View>

      <View style={styles.content}>
        {isEditing ? (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Name"
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Email"
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(text) =>
                setFormData({ ...formData, address: text })
              }
              placeholder="Address"
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="Phone"
              placeholderTextColor="#888"
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
                disabled={isLoading}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSave}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.info}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.text}>{formData.name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.text}>{formData.email}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.text}>{formData.address}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.text}>{formData.phone}</Text>
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setIsEditing(true)}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => {
            supabase.auth.signOut();
          }}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  editText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
  signOutButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  signOutText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "600",
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
    backgroundColor: "#ccc",
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
});

export default Profile;
