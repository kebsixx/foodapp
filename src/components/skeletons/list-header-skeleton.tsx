import { View, Animated, StyleSheet } from "react-native";
import { useSkeletonAnimation } from "../../hooks/useSkeletonAnimation";

export const ListHeaderSkeleton = () => {
  const opacity = useSkeletonAnimation();

  return (
    <View style={styles.container}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Animated.View style={[styles.avatar, { opacity }]} />
          <Animated.View style={[styles.welcomeText, { opacity }]} />
        </View>
        <Animated.View style={[styles.cartButton, { opacity }]} />
      </View>

      <Animated.View style={[styles.heroImage, { opacity }]} />

      <Animated.View style={[styles.sectionTitle, { opacity }]} />

      <View style={styles.categories}>
        {[1, 2, 3, 4].map((item) => (
          <Animated.View
            key={item}
            style={[styles.categoryItem, { opacity }]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E1E1E1",
    marginRight: 12,
  },
  welcomeText: {
    height: 20,
    width: 120,
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E1E1E1",
  },
  heroImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#E1E1E1",
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    height: 24,
    width: 100,
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
    marginBottom: 16,
    marginLeft: 16,
  },
  categories: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 16,
  },
  categoryItem: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#E1E1E1",
  },
});
