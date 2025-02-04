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
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#B17457",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
  },
  editOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  editText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 12,
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: 20,
  },
  form: {
    width: "100%",
  },
  input: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  info: {
    width: "100%",
  },
  infoItem: {
    marginBottom: 20,
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 10,
  },
  label: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#B17457",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  userName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
  },
  signOutButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  signOutText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Profile;
