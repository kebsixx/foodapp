import { View, Animated, StyleSheet } from "react-native";
import { useSkeletonAnimation } from "../hooks/useSkeletonAnimation";

export const CategorySkeleton = () => {
  const opacity = useSkeletonAnimation();

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.categoryImage, { opacity }]} />
      <Animated.View style={[styles.categoryName, { opacity }]} />
      <View style={styles.productsGrid}>
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.productCard}>
            <Animated.View style={[styles.productImage, { opacity }]} />
            <Animated.View style={[styles.productTitle, { opacity }]} />
            <Animated.View style={[styles.productPrice, { opacity }]} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  categoryImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#E1E1E1",
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryName: {
    height: 32,
    width: "60%",
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
    marginBottom: 16,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    marginBottom: 16,
  },
  productImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#E1E1E1",
    borderRadius: 8,
    marginBottom: 8,
  },
  productTitle: {
    height: 20,
    width: "100%",
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
    marginBottom: 8,
  },
  productPrice: {
    height: 16,
    width: "40%",
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
  },
});
