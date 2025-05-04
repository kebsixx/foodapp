import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
  Image,
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
import CustomHeader from "../components/customHeader";
import { Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";

type VariantType = {
  id: string;
  name: string;
  price: number;
} | null;

type CartItemType = {
  id: number;
  title: string;
  heroImage: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  variant: VariantType;
};

type CartItemProps = {
  item: CartItemType;
  onRemove: (id: number, variantId?: string) => void;
  onIncrement: (id: number, variantId?: string) => void;
  onDecrement: (id: number, variantId?: string) => void;
};

type PaymentProof = {
  uri: string;
  base64?: string;
} | null;

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
        {item.variant && (
          <Text style={styles.variantText}>{item.variant.name}</Text>
        )}
        <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => onDecrement(item.id, item.variant?.id)}
            style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.itemQuantity}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => onIncrement(item.id, item.variant?.id)}
            style={styles.quantityButton}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => onRemove(item.id, item.variant?.id)}
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
  const [paymentProof, setPaymentProof] = useState<PaymentProof>(null);
  const [uploading, setUploading] = useState(false);
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

  const pickPaymentProof = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setPaymentProof({
          uri: result.assets[0].uri,
          base64: result.assets[0].base64,
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Toast.show("Gagal memilih gambar", {
        type: "custom_toast",
        data: {
          title: "Gagal",
        },
      });
    }
  };

  const handleCheckout = async () => {
    if (!paymentProof?.base64) {
      Toast.show("Mohon Upload Bukti Pembayaran", {
        type: "custom_toast",
        data: {
          title: "Gagal",
        },
      });
      return;
    }

    if (!selectedPickupMethod) {
      Toast.show("Mohon Pilih Pickup Method", {
        type: "custom_toast",
        data: {
          title: "Gagal",
        },
      });
      return;
    }

    try {
      setUploading(true);
      const totalPrice = getTotalPrice();
      const slug = generateOrderSlug();

      // Upload image using base64 data
      const filePath = `${slug}-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, decode(paymentProof.base64), {
          contentType: "image/jpeg",
          cacheControl: "3600",
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        Toast.show("Mohon Masukkan Foto Bukti Pembayaran", {
          type: "custom_toast",
          data: {
            title: "Gagal",
          },
        });
        return;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("payment-proofs").getPublicUrl(filePath);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("order")
        .insert({
          totalPrice,
          slug,
          status: "Pending",
          user: id,
          description,
          pickup_method: selectedPickupMethod,
          payment_proof: publicUrl,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items with variant_id
      const { error: itemsError } = await supabase.from("order_item").insert(
        items.map((item) => ({
          order: order.id,
          product: item.id,
          quantity: item.quantity,
          variant_id: item.variant?.id || null, // Use variant_id instead of variant object
        }))
      );

      if (itemsError) throw itemsError;

      // Success handling
      resetCart();
      router.push("/orders");
      Toast.show("Pesanan berhasil dibuat!", {
        type: "custom_toast",
        data: { title: "Sukses" },
      });
    } catch (error) {
      console.error("Error creating order:", error);
      Toast.show("Gagal membuat pesanan", {
        type: "custom_toast",
        data: { title: "Gagal" },
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader title="Shopping Cart" />

      <ScrollView style={styles.content}>
        {!isStoreOpen && <StoreBanner />}

        {items.length > 0 ? (
          <>
            <FlatList
              data={items}
              scrollEnabled={false}
              keyExtractor={(item) =>
                `${item.id}-${item.variant?.id || "no-variant"}`
              }
              renderItem={({ item }) => (
                <CartItem
                  item={{
                    id: item.id,
                    title: item.title,
                    heroImage: item.heroImage,
                    price: item.price,
                    maxQuantity: item.maxQuantity,
                    quantity: item.quantity,
                    variant: item.variant as VariantType,
                  }}
                  onRemove={removeItem}
                  onIncrement={incrementItem}
                  onDecrement={decrementItem}
                />
              )}
              style={styles.itemList}
            />

            <View style={styles.pickupSection}>
              <Text style={styles.sectionTitle}>Pickup Method</Text>
              <View style={styles.pickupButtons}>
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
                    selectedPickupMethod === "delivery" &&
                      styles.selectedButton,
                  ]}
                  onPress={() => setSelectedPickupMethod("delivery")}>
                  <Text style={styles.pickupButtonText}>Jasa Antar</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.notesLabel}>Catatan Tambahan:</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                multiline
                placeholder="Tambahkan catatan untuk pesanan Anda"
              />
            </View>

            <View style={styles.paymentSection}>
              <Text style={styles.sectionTitle}>Informasi Pembayaran</Text>

              <View style={styles.bankInfoContainer}>
                <Text style={styles.bankLabel}>Silahkan transfer ke:</Text>
                <View style={styles.bankCard}>
                  <View style={styles.bankRow}>
                    <Text style={styles.bankFieldLabel}>Bank</Text>
                    <Text style={styles.bankFieldValue}>BCA</Text>
                  </View>
                  <View style={styles.bankRow}>
                    <Text style={styles.bankFieldLabel}>No. Rekening</Text>
                    <Text style={styles.bankFieldValue}>1841432971</Text>
                  </View>
                  <View style={styles.bankRow}>
                    <Text style={styles.bankFieldLabel}>Atas Nama</Text>
                    <Text style={styles.bankFieldValue}>Bagus Kornelius</Text>
                  </View>
                </View>
              </View>

              <View style={styles.uploadSection}>
                <Text style={styles.uploadLabel}>Upload Bukti Transfer</Text>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={pickPaymentProof}>
                  <Text style={styles.uploadButtonText}>
                    {paymentProof ? "Ubah Bukti Transfer" : "Pilih Foto"}
                  </Text>
                </TouchableOpacity>

                {paymentProof && (
                  <Image
                    source={{ uri: paymentProof.uri }}
                    style={styles.paymentProofImage}
                  />
                )}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyText}>Keranjang belanja kosong</Text>
          </View>
        )}
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(getTotalPrice())}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCheckout}
            style={[
              styles.checkoutButton,
              (!isStoreOpen || !selectedPickupMethod) && styles.disabledButton,
            ]}>
            <Text style={styles.checkoutButtonText}>
              {isStoreOpen ? "Checkout" : "Toko Tutup"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
  },
  itemList: {
    padding: 16,
  },
  pickupSection: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  pickupButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  pickupButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#B17457",
  },
  pickupButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  footer: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#B17457",
  },
  checkoutButton: {
    backgroundColor: "#B17457",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
  orderDetailsSection: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 16,
  },
  labelText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
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
  paymentSection: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bankInfoContainer: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginVertical: 10,
  },
  bankInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  bankDetails: {
    fontSize: 16,
    lineHeight: 24,
  },
  bankLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#495057",
    marginBottom: 12,
  },
  bankHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  bankCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
  },
  bankFieldLabel: {
    fontSize: 14,
    color: "#868e96",
  },
  bankFieldValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
  },
  uploadSection: {
    marginTop: 8,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#495057",
    marginBottom: 8,
  },
  uploadButton: {
    backgroundColor: "#B17457",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  paymentProofImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 12,
    resizeMode: "contain",
  },
  variantText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
});
