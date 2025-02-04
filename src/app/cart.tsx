import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { formatCurrency, generateOrderSlug } from "../utils/utils";
import { useCartStore } from "../store/cart-store";
import React from "react";
import { useEffect, useState } from "react";
import { createOrder, createOrderItem } from "../api/api";
import { supabase } from "../lib/supabase";
import { useToast } from "react-native-toast-notifications";
import { useAuth } from "../providers/auth-provider";
import { router } from "expo-router";

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
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPickupMethod, setSelectedPickupMethod] = useState("");
  const {
    user: { id },
  } = useAuth();

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

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string>("");

  const handleCheckout = async () => {
    const totalPrice = parseFloat(getTotalPrice());
    const slug = generateOrderSlug();

    try {
      const { data: order, error } = await supabase
        .from("order")
        .insert({
          totalPrice: totalPrice,
          slug: slug,
          status: "Pending",
          user: id,
          description: description,
          pickup_method: selectedPickupMethod,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("order_item").insert(
        items.map((item) => ({
          order: order.id,
          product: item.id,
          quantity: item.quantity,
        }))
      );

      resetCart();
      setCurrentOrderId(order.id.toString());
      setShowPaymentModal(true);

      Toast.show("Silakan cek status pesanan di halaman Orders.", {
        type: "custom_toast",
        data: {
          title: "Pesanan berhasil dibuat! 📦",
        },
      });
    } catch (error) {
      console.error("Error creating order:", error);
      Alert.alert("Error", "Gagal membuat pesanan");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {!isStoreOpen && <StoreBanner />}

        <FlatList
          data={items}
          scrollEnabled={false}
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

        <View style={styles.orderDetailsSection}>
          <Text style={styles.sectionTitle}>Detail Pesanan</Text>

          <TouchableOpacity
            style={[
              styles.pickupButton,
              selectedPickupMethod === "pickup" && styles.selectedButton,
            ]}
            onPress={() => setSelectedPickupMethod("pickup")}>
            <Text style={styles.pickupButtonText}>Ambil Sendiri</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pickupButton,
              selectedPickupMethod === "delivery" && styles.selectedButton,
            ]}
            onPress={() => setSelectedPickupMethod("delivery")}>
            <Text style={styles.pickupButtonText}>Jasa Antar</Text>
          </TouchableOpacity>

          <Text style={styles.labelText}>Catatan Tambahan:</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="Tambahkan catatan untuk pesanan Anda"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.totalText}>
          Total: {formatCurrency(parseFloat(getTotalPrice()))}
        </Text>
        <TouchableOpacity
          onPress={handleCheckout}
          style={[
            styles.checkoutButton,
            (!isStoreOpen || items.length === 0 || !selectedPickupMethod) &&
              styles.disabledButton,
          ]}>
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
    backgroundColor: "#70AF85",
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
  orderDetailsSection: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  labelText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  pickupButton: {
    backgroundColor: "#AA8976",
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
  },
  pickupButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedButton: {
    backgroundColor: "#B17457",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 10,
  },
  bankDetails: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: "#70AF85",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  confirmButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#B17457",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
function setModalVisible(arg0: boolean) {
  throw new Error("Function not implemented.");
}
