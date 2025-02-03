import { Stack, useLocalSearchParams } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
} from "react-native";

import { getMyOrder } from "../../../api/api";
import { format } from "date-fns";
import { formatCurrency } from "../../../utils/utils";
import CustomHeader from "../../../components/customHeader";

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
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader title="Order" />
      <Text style={styles.item}>{order.slug}</Text>
      <Text style={styles.details}>{order.description}</Text>
      <View style={[styles.statusBadge, styles[`statusBadge_${order.status}`]]}>
        <Text style={styles.statusText}>{order.status}</Text>
      </View>
      <Text style={styles.date}>
        {format(new Date(order.created_at), "MMM dd, yyyy")}
      </Text>
      <Text style={styles.itemsTitle}>Items Ordered:</Text>
      <FlatList
        data={orderItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.orderItem}>
            <Image source={{ uri: item.heroImage }} style={styles.heroImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.title}</Text>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.price)} x {item.quantity}
              </Text>
            </View>
          </View>
        )}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
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
  );
};

export default OrderDetails;

const styles: { [key: string]: any } = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  item: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  details: {
    fontSize: 16,
    marginBottom: 16,
  },
  statusBadge: {
    padding: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  statusBadge_Process: {
    backgroundColor: "#ffcc00",
  },
  statusBadge_Completed: {
    backgroundColor: "#4caf50",
  },
  statusBadge_Confirmed: {
    backgroundColor: "#2196f3",
  },
  statusBadge_InTransit: {
    backgroundColor: "#ff9800",
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
  },
  date: {
    fontSize: 14,
    color: "#555",
    marginTop: 16,
  },
  itemsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 8,
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  heroImage: {
    width: "50%",
    height: 100,
    borderRadius: 10,
  },
  itemInfo: {
    marginLeft: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemPrice: {
    fontSize: 14,
    marginTop: 4,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B17457",
  },
});
