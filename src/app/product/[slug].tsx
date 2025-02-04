import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  Image,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import { formatCurrency } from "../../utils/utils";
import { useToast } from "react-native-toast-notifications";
import { useCartStore } from "../../store/cart-store";
import { useState } from "react";
import { getProduct } from "../../api/api";
import CustomHeader from "../../components/customHeader";

const ProductDetails = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const toast = useToast();

  const { data: product, error, isLoading } = getProduct(slug);

  const { items, addItem, incrementItem, decrementItem } = useCartStore();

  const cartItem = items.find((item) => item.id === product?.id);

  const initialQuantity = cartItem ? cartItem.quantity : 1;

  const [quantity, setQuantity] = useState(initialQuantity);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }
  if (error) return <Text>Error: {error.message}</Text>;
  if (!product) return <Redirect href="/404" />;

  const increaseQuantity = () => {
    if (quantity < product.maxQuantity) {
      setQuantity(quantity + 1);
    } else {
      toast.show("Maksimal pembelian adalah " + product.maxQuantity, {
        type: "custom_toast",
        data: {
          title: `Maksimal pembelian adalah ${product.maxQuantity}`,
        },
      });
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
      decrementItem(product.id);
    }
  };

  const addToCart = async () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity,
      heroImage: product.heroImage,
      maxQuantity: product.maxQuantity,
    });
    toast.show("Produk berhasil ditambahkan ke keranjang", {
      type: "custom_toast",
      data: {
        title: "Sukses 🛒",
      },
    });
  };

  const totalPrice = formatCurrency(product.price * quantity);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader title={product.title} />

      <ScrollView>
        <Image source={{ uri: product.heroImage }} style={styles.heroImage} />

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{product.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity <= 1 && styles.disabledButton,
                ]}
                onPress={decreaseQuantity}
                disabled={quantity <= 1}>
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.quantity}>{quantity}</Text>

              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  quantity >= product.maxQuantity && styles.disabledButton,
                ]}
                onPress={increaseQuantity}
                disabled={quantity >= product.maxQuantity}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Gambar Produk Lainnya</Text>
          <FlatList
            data={product.imagesUrl}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.thumbnailImage} />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesContainer}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>{totalPrice}</Text>
        </View>
        <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  heroImage: {
    width: "100%",
    height: 300,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  price: {
    fontSize: 20,
    fontWeight: "600",
    color: "#B17457",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#B17457",
  },
  quantity: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 24,
  },
  thumbnailImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 8,
  },
  imagesContainer: {
    paddingVertical: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
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
  totalPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#B17457",
  },
  addToCartButton: {
    backgroundColor: "#B17457",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addToCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
