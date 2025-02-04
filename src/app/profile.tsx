import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { useAuth } from "../providers/auth-provider";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    address: user.address,
    phone: user.phone,
    avatar_url: user.avatar_url,
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData({ ...formData, avatar_url: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    await updateProfile(formData);
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          <Image source={{ uri: formData.avatar_url }} style={styles.avatar} />
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
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
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
    backgroundColor: "#B17457",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
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
});

export default Profile;
