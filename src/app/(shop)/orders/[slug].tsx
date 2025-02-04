import { Stack, useLocalSearchParams } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { getMyOrder } from "../../../api/api";
import { format } from "date-fns";
import { formatCurrency } from "../../../utils/utils";

const OrderDetails = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: order, error, isLoading } = getMyOrder(slug);

  if (isLoading) return <ActivityIndicator />;

  if (error || !order) return <Text>Error: {error?.message}</Text>;

  const orderItems = order.order_item.map((orderItem: any) => {
    return {
      id: orderItem.id,
      title: orderItem.products.title,
      heroImage: orderItem.products.heroImage,
      price: orderItem.products.price,
      quantity: orderItem.quantity,
    };
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: "Order Details" }} />

      <ScrollView style={styles.scrollView}>
        {/* Order Info Card */}
        <View style={styles.card}>
          <Text style={styles.orderNumber}>Order #{order.slug}</Text>
          <Text style={styles.date}>
            {format(new Date(order.created_at), "MMM dd, yyyy")}
          </Text>

          <View style={styles.row}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Pickup Method</Text>
              <Text style={styles.value}>{order.pickup_method}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                styles[`statusBadge_${order.status}`],
              ]}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>
        </View>

        {/* Items Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items Ordered</Text>
          <FlatList
            data={orderItems}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.orderItem}>
                <Image
                  source={{ uri: item.heroImage }}
                  style={styles.heroImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.title}</Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>

        {/* Payment Status Card */}
        {order.status === "Pending" && (
          <View style={[styles.card, styles.warningCard]}>
            <Text style={styles.paymentText}>Menunggu Pembayaran</Text>
          </View>
        )}

        {/* Total Card */}
        <View style={[styles.card, styles.totalCard]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(
                orderItems.reduce(
                  (total, item) => total + item.price * item.quantity,
                  0
                )
              )}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderDetails;

const styles: { [key: string]: any } = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    padding: 16,
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  date: {
    color: "#666",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoItem: {
    flex: 1,
  },
  label: {
    color: "#666",
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadge_Pending: {
    backgroundColor: "#FFF3CD",
  },
  statusBadge_Confirmed: {
    backgroundColor: "#D4EDDA",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 16,
  },
  heroImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  itemQuantity: {
    color: "#666",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#B17457",
  },
  warningCard: {
    backgroundColor: "#FFF3CD",
    borderWidth: 1,
    borderColor: "#FFEEBA",
  },
  paymentText: {
    color: "#856404",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  totalCard: {
    marginBottom: 32,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#B17457",
  },
});
