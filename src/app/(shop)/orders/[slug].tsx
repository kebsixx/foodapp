import { Stack, useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { getMyOrder } from "../../../api/api";
import { format } from "date-fns";
import { formatCurrency } from "../../../utils/utils";
import { supabase } from "../../../lib/supabase";
import { router } from "expo-router";
import React, { useState } from "react";
import { RefreshControl } from "react-native";
import CustomHeader from "../../../components/customHeader";

interface Order {
  id: string;
  slug: string;
  status: "Pending" | "On Review" | "Process" | "Completed" | "Cancelled";
  created_at: string;
  totalPrice: number;
}

const OrderDetails = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: order, error, isLoading, refetch } = getMyOrder(slug);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  // Better loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <CustomHeader title="Detail Pesanan" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B17457" />
          <Text style={styles.loadingText}>Memuat detail pesanan...</Text>
        </View>
      </View>
    );
  }

  if (error || !order) return <Text>Error: {error?.message}</Text>;

  const orderItems = order.order_item.map((orderItem: any) => {
    return {
      id: orderItem.id,
      title: `${orderItem.products.title}${
        orderItem.variant ? ` (${orderItem.variant})` : ""
      }`,
      heroImage: orderItem.products.heroImage,
      price: orderItem.products.price,
      quantity: orderItem.quantity,
      variant: orderItem.variant,
    };
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader title="Detail Pesanan" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#B17457"]}
            tintColor="#B17457"
          />
        }>
        {/* Order Info Card */}
        <View style={styles.card}>
          <Text style={styles.orderNumber}>Pesanan #{order.slug}</Text>
          <Text style={styles.date}>
            {format(new Date(order.created_at), "dd MMM yyyy")}
          </Text>

          <View style={styles.row}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Metode Pengambilan</Text>
              <Text style={styles.value}>
                {order.pickup_method === "pickup"
                  ? "Ambil Sendiri"
                  : "Jasa Antar"}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                order.status === "Pending" && styles.statusBadge_Pending,
                order.status === "On Review" && styles.statusBadge_OnReview,
                order.status === "Process" && styles.statusBadge_Process,
                order.status === "Completed" && styles.statusBadge_Completed,
                order.status === "Cancelled" && styles.statusBadge_Cancelled,
              ]}>
              <Text style={styles.statusText}>
                {order.status === "Pending" ? "Menunggu" :
                 order.status === "On Review" ? "Ditinjau" :
                 order.status === "Process" ? "Diproses" :
                 order.status === "Completed" ? "Selesai" :
                 order.status === "Cancelled" ? "Dibatalkan" : order.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Items Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Item Pesanan</Text>
          {orderItems.map((item) => (
            <View
              key={`${item.id}-${item.variant || "no-variant"}`}
              style={styles.orderItem}>
              <Image
                source={{ uri: item.heroImage }}
                style={styles.heroImage}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.title}</Text>
                {item.variant && (
                  <Text style={styles.variantText}>
                    Varian: {item.variant}
                  </Text>
                )}
                <Text style={styles.itemQuantity}>Jumlah: {item.quantity}</Text>
                <Text style={styles.itemPrice}>
                  {formatCurrency(item.price * item.quantity)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Status Card */}
        {order.status === "Pending" && (
          <View style={[styles.card, styles.warningCard]}>
            <Text style={styles.paymentText}>Pesanan anda sedang di cek</Text>
          </View>
        )}

        {/* Add Cancel Button for Pending Orders */}
        {order.status === "Pending" && (
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCancelModal(true)}>
              <Text style={styles.cancelButtonText}>Batalkan Pesanan</Text>
            </TouchableOpacity>

            <Modal
              animationType="fade"
              transparent={true}
              visible={showCancelModal}
              onRequestClose={() => setShowCancelModal(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Batalkan Pesanan</Text>
                  <Text style={styles.modalMessage}>
                    Apakah Anda yakin ingin membatalkan pesanan ini?
                  </Text>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonNo]}
                      onPress={() => setShowCancelModal(false)}>
                      <Text style={styles.modalButtonTextNo}>
                        Tidak, Tetap Pesan
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonYes]}
                      onPress={async () => {
                        try {
                          await supabase
                            .from("order")
                            .update({ status: "Cancelled" })
                            .eq("slug", slug);

                          setShowCancelModal(false);
                          router.replace("/orders");
                        } catch (error) {
                          console.error("Error cancelling order:", error);
                          Alert.alert("Error", "Gagal membatalkan pesanan");
                        }
                      }}>
                      <Text style={styles.modalButtonTextYes}>
                        Ya, Batalkan Pesanan
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        )}

        {/* Total Card */}
        <View style={[styles.card, styles.totalCard]}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Pembayaran</Text>
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
    paddingBottom: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
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
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  cancelButton: {
    backgroundColor: "#ff4444",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    width: "100%",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  modalButtonNo: {
    backgroundColor: "#f0f0f0",
  },
  modalButtonYes: {
    backgroundColor: "#ff4444",
  },
  modalButtonTextNo: {
    color: "#333",
    fontWeight: "600",
    fontSize: 14,
  },
  modalButtonTextYes: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  variantText: {
    color: "#666",
    fontSize: 14,
    marginBottom: 4,
  },
});
