import { View, Animated, StyleSheet } from "react-native";
import { useSkeletonAnimation } from "../hooks/useSkeletonAnimation";

export const OrderDetailsSkeleton = () => {
  const opacity = useSkeletonAnimation();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Animated.View style={[styles.orderNumber, { opacity }]} />
        <Animated.View style={[styles.date, { opacity }]} />
        <View style={styles.row}>
          <Animated.View style={[styles.statusBadge, { opacity }]} />
        </View>
      </View>

      <View style={styles.card}>
        <Animated.View style={[styles.sectionTitle, { opacity }]} />
        {[1, 2].map((item) => (
          <View key={item} style={styles.orderItem}>
            <Animated.View style={[styles.itemImage, { opacity }]} />
            <View style={styles.itemInfo}>
              <Animated.View style={[styles.itemTitle, { opacity }]} />
              <Animated.View style={[styles.itemPrice, { opacity }]} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.totalRow}>
          <Animated.View style={[styles.totalLabel, { opacity }]} />
          <Animated.View style={[styles.totalAmount, { opacity }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderNumber: {
    height: 24,
    width: "40%",
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
    marginBottom: 8,
  },
  date: {
    height: 16,
    width: "30%",
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    height: 24,
    width: "20%",
    backgroundColor: "#E1E1E1",
    borderRadius: 12,
  },
  sectionTitle: {
    height: 20,
    width: "40%",
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    backgroundColor: "#E1E1E1",
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    height: 20,
    width: "80%",
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
    marginBottom: 8,
  },
  itemPrice: {
    height: 16,
    width: "40%",
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    height: 20,
    width: "30%",
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
  },
  totalAmount: {
    height: 20,
    width: "20%",
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
  },
});
