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
import { useState, useEffect } from "react";
import { getProduct, getProductsAndCategories } from "../../api/api";
import CustomHeader from "../../components/customHeader";
import { router } from "expo-router";

// Define the variant type
type Variant = {
  id: string;
  name: string;
  price: number;
  available: boolean;
};

const ProductDetails = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const toast = useToast();

  const { data: product, error, isLoading } = getProduct(slug);

  const { items, addItem, incrementItem, decrementItem } = useCartStore();

  const cartItem = items.find((item) => item.id === product?.id);

  const initialQuantity = cartItem ? cartItem.quantity : 1;

  const [quantity, setQuantity] = useState(initialQuantity);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  const { data: productsData } = getProductsAndCategories();

  // Inside the useEffect where we parse variants
  useEffect(() => {
    if (product && product.variants) {
      try {
        // Make sure we're properly parsing the variants
        const parsedVariants = Array.isArray(product.variants)
          ? product.variants
          : typeof product.variants === "object"
          ? Object.values(product.variants)
          : [];

        console.log("Parsed variants:", parsedVariants); // Debug log

        // Set default available to true if not specified
        const processedVariants = parsedVariants.map((v: any) => ({
          ...v,
          available: v.available !== undefined ? v.available : true,
        }));
        setVariants(processedVariants);

        // Select the first variant by default (whether available or not)
        if (processedVariants.length > 0) {
          const defaultVariant =
            processedVariants.find((v) => v.available !== false) ||
            processedVariants[0];
          setSelectedVariant(defaultVariant);
          setCurrentPrice(defaultVariant.price || product.price);
        } else {
          setCurrentPrice(product.price);
        }
      } catch (e) {
        console.error("Error parsing variants:", e);
        setCurrentPrice(product.price);
      }
    } else if (product) {
      setCurrentPrice(product.price);
    }
  }, [product]);

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

  const selectVariant = (variant: Variant) => {
    // Remove the availability check or make it more lenient
    // Only show a toast if explicitly marked as unavailable
    if (variant.available === false) {
      toast.show("Varian ini tidak tersedia", {
        type: "custom_toast",
        data: {
          title: "Varian tidak tersedia",
        },
      });
      return;
    }

    setSelectedVariant(variant);
    setCurrentPrice(variant.price);
  };

  const addToCart = async () => {
    if (currentPrice !== null) {
      const itemToAdd = {
        id: product.id,
        title:
          product.title + (selectedVariant ? ` (${selectedVariant.name})` : ""),
        price: currentPrice,
        quantity,
        heroImage: product.heroImage,
        maxQuantity: product.maxQuantity,
        variant: selectedVariant ? selectedVariant.id : null,
      };

      addItem(itemToAdd);
      toast.show("Produk berhasil ditambahkan ke keranjang", {
        type: "custom_toast",
        data: {
          title: "Sukses 🛒",
        },
      });
    }
  };

  const totalPrice =
    currentPrice !== null
      ? formatCurrency(currentPrice * quantity)
      : formatCurrency(0);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader title={product.title} />

      <ScrollView>
        <Image source={{ uri: product.heroImage }} style={styles.heroImage} />

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{product.title}</Text>

          {/* Variant Selector */}
          {variants.length > 0 && (
            <View style={styles.variantsContainer}>
              <Text style={styles.variantTitle}>Pilih Varian:</Text>
              <View style={styles.variantOptions}>
                {variants.map((variant) => (
                  <TouchableOpacity
                    key={variant.id}
                    style={[
                      styles.variantButton,
                      selectedVariant?.id === variant.id &&
                        styles.selectedVariantButton,
                      variant.available === false &&
                        styles.unavailableVariantButton,
                    ]}
                    onPress={() => selectVariant(variant)}
                    disabled={variant.available === false} // Only disable if explicitly false
                  >
                    <Text
                      style={[
                        styles.variantButtonText,
                        selectedVariant?.id === variant.id &&
                          styles.selectedVariantText,
                        variant.available === false &&
                          styles.unavailableVariantText,
                      ]}>
                      {variant.name}
                    </Text>
                    <Text
                      style={[
                        styles.variantPrice,
                        selectedVariant?.id === variant.id &&
                          styles.selectedVariantText,
                        variant.available === false &&
                          styles.unavailableVariantText,
                      ]}>
                      {formatCurrency(variant.price)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {currentPrice !== null
                ? formatCurrency(currentPrice)
                : formatCurrency(0)}
            </Text>
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
                    {formatCurrency(item.price || 0)}
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
  // New styles for variants
  variantsContainer: {
    marginVertical: 16,
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
  },
  variantTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  variantOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  variantButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    minWidth: 100,
    alignItems: "center",
  },
  selectedVariantButton: {
    borderColor: "#B17457",
    backgroundColor: "#f8f1ee",
  },
  unavailableVariantButton: {
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
    opacity: 0.6,
  },
  variantButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  selectedVariantText: {
    color: "#B17457",
    fontWeight: "600",
  },
  unavailableVariantText: {
    color: "#999",
  },
  variantPrice: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});
