import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { Link, Stack } from "expo-router";
import { format } from "date-fns";
import CustomHeader from "../../../components/customHeader";
import { formatCurrency } from "../../../utils/utils";
import { getMyOrders } from "../../../api/api";
import { RefreshControl } from "react-native";
import { useState } from "react";

interface Order {
  id: string;
  slug: string;
  status: "Pending" | "On Review" | "Process" | "Completed" | "Cancelled";
  created_at: string;
  totalPrice: number;
  variant?: string;
  product_title: string;
}

export default function Orders() {
  const { data: orders, error, isLoading, refetch } = getMyOrders();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading && !refreshing)
    return <ActivityIndicator size="large" color="#B17457" />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View style={styles.container}>
      <CustomHeader title="Orders" />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={orders}
        keyExtractor={(item) => `${item.id}-${item.variant || "no-variant"}`} // Gunakan kombinasi ID dan variant sebagai key
        contentContainerStyle={{ paddingBottom: 80, padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#B17457"]}
            tintColor="#B17457"
          />
        }
        renderItem={({ item }) => (
          <Link href={`/orders/${item.slug}`} asChild>
            <TouchableOpacity style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNumber} numberOfLines={1}>
                    {item.product_title}
                  </Text>
                  <Text style={styles.orderId}>Order #{item.slug}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === "Pending" && styles.statusBadge_Pending,
                    item.status === "On Review" && styles.statusBadge_OnReview,
                    item.status === "Process" && styles.statusBadge_Process,
                    item.status === "Completed" && styles.statusBadge_Completed,
                    item.status === "Cancelled" && styles.statusBadge_Cancelled,
                  ]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  orderId: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#eee",
  },
  statusBadge_Pending: {
    backgroundColor: "#FFF3E0",
  },
  statusBadge_OnReview: {
    backgroundColor: "#E3F2FD",
  },
  statusBadge_Process: {
    backgroundColor: "#E8F5E9",
  },
  statusBadge_Completed: {
    backgroundColor: "#E8F5E9",
  },
  statusBadge_Cancelled: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },
});
