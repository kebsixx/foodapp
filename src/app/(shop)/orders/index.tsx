import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { Link, Stack } from "expo-router";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase";
import CustomHeader from "../../../components/customHeader";
import { formatCurrency } from "../../../utils/utils";

const ITEMS_PER_PAGE = 10;

interface Order {
  id: string;
  slug: string;
  status: "Pending" | "Confirmed" | "Process" | "Completed";
  created_at: string;
  totalPrice: number;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchOrders = async (pageNumber: number) => {
    try {
      const { data, error } = await supabase
        .from("order")
        .select("*")
        .range(
          pageNumber * ITEMS_PER_PAGE,
          (pageNumber + 1) * ITEMS_PER_PAGE - 1
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data.length < ITEMS_PER_PAGE) {
        setHasMore(false);
      }

      const formattedData = data.map((order) => ({
        ...order,
        id: order.id.toString(),
        status: order.status as
          | "Pending"
          | "Confirmed"
          | "Process"
          | "Completed",
      }));

      if (pageNumber === 0) {
        setOrders(formattedData);
      } else {
        setOrders([...orders, ...formattedData]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(0);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      fetchOrders(page + 1);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Orders" />
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loading ? <ActivityIndicator size="large" color="#B17457" /> : null
        }
        renderItem={({ item }) => (
          <Link href={`/orders/${item.slug}`} asChild>
            <TouchableOpacity style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>Order #{item.slug}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === "Pending" && styles.statusBadge_Pending,
                    item.status === "Confirmed" && styles.statusBadge_Confirmed,
                    item.status === "Process" && styles.statusBadge_Process,
                    item.status === "Completed" && styles.statusBadge_Completed,
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
  statusBadge_Confirmed: {
    backgroundColor: "#64B5F6",
  },
  statusBadge_Pending: {
    backgroundColor: "#FFB74D",
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
