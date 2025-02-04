import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import { Link } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

import { useCartStore } from "../store/cart-store";
import { Tables } from "../types/database.types";
import { useAuth } from "../providers/auth-provider";

export const ListHeader = ({
  categories,
  users,
}: {
  categories: Tables<"category">[];
  users: Tables<"users">[];
}) => {
  const { getItemCount } = useCartStore();

  const { user } = useAuth();

  const currentUser = users.find((u) => u.id === user?.id);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Link href="/profile" asChild>
            <Pressable style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    currentUser?.avatar_url ||
                    "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_640.png",
                }}
                style={styles.avatarImage}
              />
              <Text style={styles.welcomeText}>
                Welcome, {currentUser?.name || "Guest"}
              </Text>
            </Pressable>
          </Link>
        </View>

        <Link href="/cart" asChild>
          <Pressable style={styles.cartButton}>
            {({ pressed }) => (
              <>
                <FontAwesome
                  name="shopping-cart"
                  size={25}
                  color="#333"
                  style={{ opacity: pressed ? 0.5 : 1 }}
                />
                {getItemCount() > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{getItemCount()}</Text>
                  </View>
                )}
              </>
            )}
          </Pressable>
        </Link>
      </View>

      <View style={styles.heroContainer}>
        <Image
          source={require("../../assets/images/hero.jpg")}
          style={styles.heroImage}
        />
      </View>

      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <Link asChild href={`/categories/${item.slug}`}>
              <Pressable style={styles.category}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.categoryImage}
                />
                <Text style={styles.categoryText}>{item.name}</Text>
              </Pressable>
            </Link>
          )}
          keyExtractor={(item) => item.name}
          horizontal
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  cartButton: {
    padding: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "#B17457",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  heroContainer: {
    marginBottom: 24,
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  categoriesContainer: {},
  category: {
    width: 100,
    alignItems: "center",
    marginBottom: 16,
  },
  categoryImage: {
    width: 70,
    height: 70,
    borderRadius: 30,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    padding: 8,
    textAlign: "center",
  },
});
