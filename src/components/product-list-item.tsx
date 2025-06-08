import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "../utils/utils";
import { useState } from "react";
import { Link } from "expo-router";
import { Tables } from "../types/database.types";

export const ProductListItem = ({
  product,
}: {
  product: Tables<"product">;
}) => {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <Link href={`/product/${product.slug}`} asChild>
      <Pressable style={styles.item}>
        <View style={styles.itemImageContainer}>
          {imageLoading && (
            <View style={[styles.itemImage, styles.imagePlaceholder]} />
          )}
          <Image
            source={{ uri: product.heroImage }}
            style={[styles.itemImage, imageLoading ? styles.hiddenImage : null]}
            onLoadEnd={() => setImageLoading(false)}
          />
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.itemPrice}>
            {formatCurrency(product.price ?? 0)}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  item: {
    flex: 1,
    backgroundColor: "white",
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImageContainer: {
    width: "100%",
    aspectRatio: 1, // Added to maintain square ratio
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },
  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  itemTextContainer: {
    padding: 12,
    backgroundColor: "white",
    gap: 6,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    lineHeight: 20,
    height: 40,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#B17457",
  },
  imagePlaceholder: {
    backgroundColor: "#E1E1E1",
    position: "absolute",
  },
  hiddenImage: {
    opacity: 0,
  },
});
