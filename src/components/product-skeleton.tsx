import { View, Animated, StyleSheet, Dimensions } from "react-native";
import { useEffect, useRef } from "react";

export const ProductSkeleton = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.skeletonItem}>
      <Animated.View style={[styles.skeletonImage, { opacity }]} />
      <View style={styles.skeletonContent}>
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />
        <Animated.View style={[styles.skeletonPrice, { opacity }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonItem: {
    width: "48%",
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
  skeletonImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#E1E1E1",
  },
  skeletonContent: {
    padding: 12,
    gap: 8,
  },
  skeletonTitle: {
    height: 40,
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
  },
  skeletonPrice: {
    height: 24,
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
    width: "50%",
  },
});
