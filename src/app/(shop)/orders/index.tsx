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

const ITEMS_PER_PAGE = 10;

interface Order {
  id: string;
  slug: string;
  status: "Pending" | "On Review" | "Process" | "Completed" | "Cancelled";
  created_at: string;
  totalPrice: number;
}

export default function Orders() {
  const { data: orders, error, isLoading } = getMyOrders();

  if (isLoading) return <ActivityIndicator size="large" color="#B17457" />;
  if (error) return <Text>Error: {error.message}</Text>;

  return (
    <View style={styles.container}>
      <CustomHeader title="Orders" />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={`/orders/${item.slug}`} asChild>
            <TouchableOpacity style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>Order #{item.slug}</Text>
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

              <Text style={styles.orderDate}>
                {format(new Date(item.created_at), "MMM dd, yyyy • HH:mm")}
              </Text>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>
                  {formatCurrency(item.totalPrice)}
                </Text>
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
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  statusBadge_Process: {
    backgroundColor: "#81C784",
  },
  statusBadge_Completed: {
    backgroundColor: "#4CAF50",
  },
  statusBadge_OnReview: {
    backgroundColor: "#FFA726",
  },
  statusBadge_Pending: {
    backgroundColor: "#FF5722",
  },
  statusBadge_Cancelled: {
    backgroundColor: "#FF0000",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B17457",
  },
});
