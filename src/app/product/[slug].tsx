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
import { getProduct, getProductsAndCategories } from "../../api/api";
import CustomHeader from "../../components/customHeader";
import { router } from "expo-router";

const ProductDetails = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const toast = useToast();

  const { data: product, error, isLoading } = getProduct(slug);

  const { items, addItem, incrementItem, decrementItem } = useCartStore();

  const cartItem = items.find((item) => item.id === product?.id);

  const initialQuantity = cartItem ? cartItem.quantity : 1;

  const [quantity, setQuantity] = useState(initialQuantity);

  const { data: productsData } = getProductsAndCategories();

  // Create a filtered list of related products
  const relatedProducts =
    product && productsData?.products
      ? productsData.products
          .filter((p) => p.category === product.category && p.id !== product.id)
          .slice(0, 5)
      : [];

  // Update the loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B17457" />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
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

          <Text style={styles.sectionTitle}>Related Products</Text>
          <FlatList
            data={relatedProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.relatedProductItem}
                onPress={() => router.push(`/product/${item.slug}`)}>
                <Image
                  source={{ uri: item.heroImage }}
                  style={styles.relatedProductImage}
                />
                <View style={styles.relatedProductInfo}>
                  <Text style={styles.relatedProductTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.relatedProductPrice}>
                    {formatCurrency(item.price)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedProductsContainer}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>No related products found</Text>
            )}
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
  relatedProductItem: {
    width: 160,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  relatedProductImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  relatedProductInfo: {
    padding: 8,
  },
  relatedProductTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    color: "#333",
  },
  relatedProductPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B17457",
  },
  relatedProductsContainer: {
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
    padding: 16,
  },
});
