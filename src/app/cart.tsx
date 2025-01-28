import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
} from "react-native";
import { formatCurrency } from "../utils/utils";
import { useCartStore } from "../store/cart-store";
import React from "react";
import {
  createMidtransPayment,
  createOrder,
  createOrderItem,
} from "../api/api";
import { useToast } from "react-native-toast-notifications";
import { WebView } from "react-native-webview";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type CartItemType = {
  id: number;
  title: string;
  heroImage: string;
  price: number;
  quantity: number;
  maxQuantity: number;
};

type CartItemProps = {
  item: CartItemType;
  onRemove: (id: number) => void;
  onIncrement: (id: number) => void;
  onDecrement: (id: number) => void;
};

const CartItem = ({
  item,
  onDecrement,
  onIncrement,
  onRemove,
}: CartItemProps) => {
  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.heroImage }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => onDecrement(item.id)}
            style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.itemQuantity}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => onIncrement(item.id)}
            style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => onRemove(item.id)}
        style={styles.removeButton}>
        <Text style={styles.removeButtonText}>Hapus</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function Cart() {
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const { mutateAsync: initiateMidtransPayment } = createMidtransPayment();

  const {
    items,
    removeItem,
    incrementItem,
    decrementItem,
    getTotalPrice,
    resetCart,
  } = useCartStore();

  const { mutateAsync: createSupabaseOrder } = createOrder();
  const { mutateAsync: createSupabaseOrderItem } = createOrderItem();

  const Toast = useToast();
  useEffect(() => {
    const checkStoreStatus = async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("is_open")
        .single();

      if (data) {
        setIsStoreOpen(data.is_open!);
      }

      if (error) {
        console.error("Error fetching store status:", error);
      }

      setLoading(false);
    };

    checkStoreStatus();

    const channel = supabase
      .channel("store_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "store_settings" },
        (payload) => {
          if (payload.new && "is_open" in payload.new) {
            setIsStoreOpen(payload.new.is_open);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const StoreBanner = () => (
    <View style={styles.bannerContainer}>
      <Text style={styles.bannerText}>
        Maaf, toko sedang tutup. Silahkan kembali lagi nanti.
      </Text>
    </View>
  );

  const handleCheckout = async () => {
    const totalPrice = parseFloat(getTotalPrice());

    try {
      const order = await createSupabaseOrder({ totalPrice });

      await createSupabaseOrderItem(
        items.map((item) => ({
          orderId: order.id,
          productId: item.id,
          quantity: item.quantity,
        }))
      );

      const paymentResponse = await initiateMidtransPayment({
        orderId: order.id.toString(),
        totalAmount: totalPrice,
      });

      if (paymentResponse.redirect_url) {
        setPaymentUrl(paymentResponse.redirect_url);
        setShowPayment(true);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      Alert.alert("Error", "Failed to process payment");
    }
  };

  return (
    <View style={styles.container}>
      {!isStoreOpen && <StoreBanner />}

      {showPayment && (
        <Modal
          visible={showPayment}
          onRequestClose={() => setShowPayment(false)}
          animationType="slide">
          <WebView
            source={{ uri: paymentUrl }}
            onNavigationStateChange={(navState) => {
              // Handle payment completion
              if (navState.url.includes("transaction_status=settlement")) {
                setShowPayment(false);
                Toast.show("Pembayaran berhasil!", {
                  type: "custom_toast",
                  data: { title: "Sukses" },
                });
                resetCart();
              }
            }}
          />
        </Modal>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onRemove={removeItem}
            onIncrement={incrementItem}
            onDecrement={decrementItem}
          />
        )}
        style={styles.cartList}
      />

      <View style={styles.footer}>
        <Text style={styles.totalText}>
          Total: {formatCurrency(parseFloat(getTotalPrice()))}
        </Text>
        <TouchableOpacity
          onPress={handleCheckout}
          style={[
            styles.checkoutButton,
            (!isStoreOpen || items.length === 0) && styles.disabledButton,
          ]}
          disabled={!isStoreOpen || items.length === 0}>
          <Text style={styles.checkoutButtonText}>
            {isStoreOpen ? "Checkout" : "Toko Tutup"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  cartList: {
    paddingVertical: 16,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: "#888",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  removeButton: {
    padding: 8,
    backgroundColor: "#ff5252",
    borderRadius: 8,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  checkoutButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    backgroundColor: "#ddd",
    marginHorizontal: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  bannerContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  bannerText: {
    color: "#c62828",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
    opacity: 0.7,
  },
});
function setSnapUrl(redirect_url: any) {
  throw new Error("Function not implemented.");
}
