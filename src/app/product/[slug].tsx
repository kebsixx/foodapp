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
  Modal,
  Animated,
  Dimensions,
  SafeAreaView,
} from "react-native";

import { formatCurrency } from "../../utils/utils";
import { useToast } from "react-native-toast-notifications";
import { useCartStore } from "../../store/cart-store";
import { useState, useEffect, useRef } from "react";
import { getProduct, getProductsAndCategories } from "../../api/api";
import CustomHeader from "../../components/customHeader";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { RefreshControl } from "react-native";
import { ProductDetailsSkeleton } from "../../components/skeletons/product-details-skeleton";

// Define the variant type
type Variant = {
  id: string;
  name: string;
  price: number;
  available: boolean;
};

const { height, width } = Dimensions.get("window");

const ProductDetails = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const toast = useToast();

  const { data: product, error, isLoading, refetch } = getProduct(slug);

  const { items, addItem } = useCartStore();

  const cartItem = items.find((item) => item.id === product?.id);

  const initialQuantity = cartItem ? cartItem.quantity : 1;

  const [quantity, setQuantity] = useState(initialQuantity);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;

  const { data: productsData } = getProductsAndCategories();

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (product && product.variants) {
      try {
        const parsedVariants = Array.isArray(product.variants)
          ? product.variants
          : typeof product.variants === "object"
          ? Object.values(product.variants)
          : [];

        const processedVariants = parsedVariants.map((v: any) => ({
          ...v,
          available: v.available !== false,
        }));

        setVariants(processedVariants);

        // Pilih variant pertama yang available atau variant pertama
        if (processedVariants.length > 0) {
          const defaultVariant =
            processedVariants.find((v) => v.available) || processedVariants[0];
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
  if (isLoading && !refreshing) {
    return <ProductDetailsSkeleton />;
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
    }
  };

  const selectVariant = (variant: Variant) => {
    // Pastikan variant tersedia
    if (variant.available === false) {
      toast.show("Varian ini tidak tersedia", {
        type: "custom_toast",
        data: { title: "Varian tidak tersedia" },
      });
      return;
    }

    // Update selected variant dan harga
    setSelectedVariant(variant);
    setCurrentPrice(variant.price);

    // Reset quantity ke 1 setiap ganti variant
    setQuantity(1);
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const addToCart = async () => {
    if (currentPrice !== null) {
      const itemToAdd = {
        id: product.id,
        title: product.title,
        heroImage: product.heroImage,
        price: currentPrice,
        quantity,
        maxQuantity: product.maxQuantity,
        variant: selectedVariant
          ? {
              id: selectedVariant.id,
              name: selectedVariant.name,
              price: selectedVariant.price,
            }
          : null,
      };

      addItem(itemToAdd);
      toast.show("Produk ditambahkan ke keranjang", {
        type: "custom_toast",
        data: { title: "Berhasil" },
      });
      closeModal();
    }
  };

  const totalPrice =
    currentPrice !== null
      ? formatCurrency(currentPrice * quantity)
      : formatCurrency(0);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader title={product.title} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#B17457"]}
            tintColor="#B17457"
          />
        }>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.heroImage }} style={styles.heroImage} />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.productInfoCard}>
            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.price}>
              {currentPrice !== null
                ? formatCurrency(currentPrice)
                : formatCurrency(0)}
            </Text>

            {variants.length > 0 && (
              <View style={styles.variantIndicator}>
                <Ionicons name="options-outline" size={16} color="#666" />
                <Text style={styles.variantText}>
                  {variants.length} varian tersedia
                </Text>
              </View>
            )}
          </View>

          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.sectionTitle}>Produk Terkait</Text>
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
                      <Text
                        style={styles.relatedProductTitle}
                        numberOfLines={2}>
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
                  <Text style={styles.emptyText}>
                    No related products found
                  </Text>
                )}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={openModal}
          activeOpacity={0.8}>
          <Ionicons name="cart-outline" size={22} color="#fff" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Modal for Quantity and Variants */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={closeModal}
            activeOpacity={1}
          />
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customize Order</Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Product Image and Basic Info */}
            <View style={styles.modalProductInfo}>
              <Image
                source={{ uri: product.heroImage }}
                style={styles.modalProductImage}
              />
              <View style={styles.modalProductDetails}>
                <Text style={styles.modalProductTitle} numberOfLines={2}>
                  {product.title}
                </Text>
                <Text style={styles.modalProductPrice}>
                  {currentPrice !== null
                    ? formatCurrency(currentPrice)
                    : formatCurrency(0)}
                </Text>
                <Text style={styles.modalProductStock}>
                  Stock: {product.maxQuantity}
                </Text>
              </View>
            </View>

            {/* Variant Selector */}
            {variants.length > 0 && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Pilih Varian:</Text>
                <View style={styles.variantOptions}>
                  {variants.map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const isAvailable = variant.available !== false;

                    return (
                      <TouchableOpacity
                        key={variant.id}
                        style={[
                          styles.variantButton,
                          isSelected && styles.selectedVariantButton,
                          !isAvailable && styles.unavailableVariantButton,
                        ]}
                        onPress={() => selectVariant(variant)}
                        disabled={!isAvailable}
                        activeOpacity={0.7}>
                        {isSelected && (
                          <View style={styles.selectedBadge}>
                            <Ionicons name="checkmark" size={12} color="#fff" />
                          </View>
                        )}

                        <Text
                          style={[
                            styles.variantButtonText,
                            isSelected && styles.selectedVariantText,
                            !isAvailable && styles.unavailableVariantText,
                          ]}>
                          {variant.name}
                        </Text>

                        <Text
                          style={[
                            styles.variantPrice,
                            isSelected && styles.selectedVariantText,
                            !isAvailable && styles.unavailableVariantText,
                          ]}>
                          {formatCurrency(variant.price)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Quantity Selector */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Jumlah:</Text>
              <View style={styles.quantityControlsContainer}>
                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity <= 1 && styles.disabledButton,
                  ]}
                  onPress={decreaseQuantity}
                  disabled={quantity <= 1}>
                  <Ionicons
                    name="remove"
                    size={20}
                    color={quantity <= 1 ? "#999" : "#333"}
                  />
                </TouchableOpacity>

                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantity}>{quantity}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    quantity >= product.maxQuantity && styles.disabledButton,
                  ]}
                  onPress={increaseQuantity}
                  disabled={quantity >= product.maxQuantity}>
                  <Ionicons
                    name="add"
                    size={20}
                    color={quantity >= product.maxQuantity ? "#999" : "#333"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Total and Add to Cart Button */}
            <View style={styles.modalFooter}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>{totalPrice}</Text>
              </View>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={addToCart}
                activeOpacity={0.8}>
                <Ionicons
                  name="cart"
                  size={20}
                  color="#fff"
                  style={styles.confirmButtonIcon}
                />
                <Text style={styles.confirmButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageContainer: {
    width: "100%",
    height: 300,
    backgroundColor: "#f8f8f8",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  productInfoCard: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: -20,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  price: {
    fontSize: 22,
    fontWeight: "600",
    color: "#B17457",
    marginBottom: 8,
  },
  variantIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  variantText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  relatedSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  relatedProductsContainer: {
    paddingVertical: 8,
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
    overflow: "hidden",
  },
  relatedProductImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  relatedProductInfo: {
    padding: 10,
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
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
    padding: 16,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  addToCartButton: {
    backgroundColor: "#B17457",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  addToCartText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 16,
    maxHeight: height * 0.85,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalProductInfo: {
    flexDirection: "row",
    marginBottom: 24,
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  modalProductImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  modalProductDetails: {
    marginLeft: 16,
    flex: 1,
    justifyContent: "center",
  },
  modalProductTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  modalProductPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#B17457",
    marginBottom: 4,
  },
  modalProductStock: {
    fontSize: 14,
    color: "#666",
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  variantOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  variantButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    minWidth: 100,
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
    position: "relative",
  },
  selectedVariantButton: {
    borderColor: "#B17457",
    backgroundColor: "#f8f1ee",
    borderWidth: 2,
  },
  unavailableVariantButton: {
    borderColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },
  selectedBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#B17457",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
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
  quantityControlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityDisplay: {
    width: 60,
    alignItems: "center",
  },
  quantity: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#B17457",
  },
  confirmButton: {
    backgroundColor: "#B17457",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
  },
  confirmButtonIcon: {
    marginRight: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  variantContent: {
    flex: 1,
    alignItems: "center",
  },
  selectedIndicator: {
    position: "absolute",
    top: 5,
    right: 5,
  },
});
