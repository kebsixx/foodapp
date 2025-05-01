import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { Tables } from "../types/database.types";
import { ProductListItem } from "./product-list-item";
import { Link } from "expo-router";

type Props = {
  title: string;
  products: Tables<"product">[];
  categorySlug: string; // Add categorySlug prop
};

export const CategoryProducts = ({ title, products, categorySlug }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Link href={`/categories/${categorySlug}`} asChild>
          <Pressable>
            {({ pressed }) => (
              <Text style={[styles.seeAll, { opacity: pressed ? 0.7 : 1 }]}>
                See All
              </Text>
            )}
          </Pressable>
        </Link>
      </View>

      <FlatList
        data={products}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <ProductListItem product={item} />
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  seeAll: {
    color: "#B17457",
    fontSize: 14,
    fontWeight: "500",
  },
  productsList: {
    paddingHorizontal: 10,
    gap: 12,
  },
  productCard: {
    width: 220,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
});
