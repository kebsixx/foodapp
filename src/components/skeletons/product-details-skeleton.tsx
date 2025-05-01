import { View, Animated, StyleSheet, Dimensions } from "react-native";
import { useSkeletonAnimation } from "../../hooks/useSkeletonAnimation";

const { width } = Dimensions.get("window");

export const ProductDetailsSkeleton = () => {
  const opacity = useSkeletonAnimation();

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.heroImage, { opacity }]} />

      <View style={styles.contentContainer}>
        <View style={styles.productInfoCard}>
          <Animated.View style={[styles.title, { opacity }]} />
          <Animated.View style={[styles.price, { opacity }]} />
          <Animated.View style={[styles.variantIndicator, { opacity }]} />
        </View>

        <View style={styles.relatedSection}>
          <Animated.View style={[styles.sectionTitle, { opacity }]} />
          <View style={styles.relatedProducts}>
            {[1, 2, 3].map((item) => (
              <Animated.View
                key={item}
                style={[styles.relatedItem, { opacity }]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  heroImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#E1E1E1",
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  productInfoCard: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: -20,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    height: 28,
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
    marginBottom: 16,
    width: "80%",
  },
  price: {
    height: 24,
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
    marginBottom: 16,
    width: "40%",
  },
  variantIndicator: {
    height: 20,
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
    width: "30%",
  },
  relatedSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    height: 24,
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
    marginBottom: 16,
    width: "40%",
  },
  relatedProducts: {
    flexDirection: "row",
    gap: 12,
  },
  relatedItem: {
    width: 160,
    height: 200,
    backgroundColor: "#E1E1E1",
    borderRadius: 12,
  },
});
