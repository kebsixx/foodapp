import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  RefreshControl,
  ActivityIndicator,
  Animated,
  FlatList,
} from "react-native";
import { ProductListItem } from "../../components/product-list-item";
import { ListHeader } from "../../components/list-header";
import { getProductsAndCategories, getBestSellerProducts } from "../../api/api";
import { CategoryProducts } from "../../components/category-products";
import { useTranslation } from "react-i18next";
import { useScroll } from "../../contexts/_ScrollContext";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const Home = () => {
  const { data, error, isLoading, refetch } = getProductsAndCategories();
  const {
    data: bestSellerProducts,
    isLoading: isBestSellerLoading,
    error: bestSellerError,
    refetch: refetchBestSellers,
  } = getBestSellerProducts();
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState(2);
  const [loadingMore, setLoadingMore] = useState(false);
  const { t } = useTranslation();
  const { onScroll } = useScroll();

  // --- START PERUBAHAN 1: Mengurutkan kategori untuk Header ---
  const sortedCategoriesForHeader = useMemo(() => {
    if (!data?.categories) return [];
    // Buat salinan agar tidak mengubah data asli dari cache
    return [...data.categories].sort((a, b) => {
      const aIsSenja = a.imageUrl?.includes("ceritasenja");
      const bIsSenja = b.imageUrl?.includes("ceritasenja");
      if (aIsSenja && !bIsSenja) return 1; // 'a' (senja) ke belakang
      if (!aIsSenja && bIsSenja) return -1; // 'a' (bukan senja) ke depan
      return 0; // Jaga urutan asli jika keduanya sama
    });
  }, [data?.categories]);

  // --- START PERUBAHAN 2: Mengurutkan kategori untuk Daftar Utama ---
  const sortedCategoriesForList = useMemo(() => {
    if (!data?.categories || !data?.products) return [];

    // Fungsi untuk menghitung produk "ceritasenja" dalam sebuah kategori
    const countSenjaProducts = (categoryId: number) => {
      return data.products.filter(
        (p) => p.category === categoryId && p.heroImage?.includes("ceritasenja")
      ).length;
    };

    // Buat salinan dan urutkan
    return [...data.categories].sort((a, b) => {
      const countA = countSenjaProducts(a.id);
      const countB = countSenjaProducts(b.id);
      return countA - countB; // Urutkan dari jumlah terkecil ke terbesar
    });
  }, [data?.categories, data?.products]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([refetch(), refetchBestSellers()]);
      setVisibleCategories(2);
    } finally {
      setRefreshing(false);
    }
  };

  const onEndReached = useCallback(() => {
    // --- START PERUBAHAN 3: Gunakan panjang data yang sudah diurutkan ---
    if (!loadingMore && visibleCategories < sortedCategoriesForList.length) {
      setLoadingMore(true);
      setTimeout(() => {
        setVisibleCategories((prev) =>
          Math.min(prev + 2, sortedCategoriesForList.length)
        );
        setLoadingMore(false);
      }, 500);
    }
  }, [sortedCategoriesForList, visibleCategories, loadingMore]);

  if ((isLoading || isBestSellerLoading) && !refreshing) {
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="large" color="#B17457" />
      </View>
    );
  }

  if ((error && !data) || (bestSellerError && !bestSellerProducts))
    return (
      <Text>{(error || bestSellerError)?.message || t("common.error")}</Text>
    );

  // --- START PERUBAHAN 4: Buat visibleData dari data yang sudah diurutkan ---
  const visibleData = {
    ...data,
    categories: sortedCategoriesForList.slice(0, visibleCategories),
  };

  return (
    <Animated.FlatList
      style={styles.container}
      ListHeaderComponent={() => (
        <>
          {/* --- START PERUBAHAN 5: Gunakan kategori yang sudah diurutkan untuk header --- */}
          <ListHeader
            categories={sortedCategoriesForHeader}
            users={data?.users || []}
          />

          {/* Best Seller Menu Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("home.bestSeller")}</Text>
            <FlatList
              data={bestSellerProducts || []}
              renderItem={({ item }) => <ProductListItem product={item} />}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.flatListColumn}
              contentContainerStyle={styles.featuredProducts}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Belum ada menu terlaris</Text>
                </View>
              )}
            />
          </View>
        </>
      )}
      // Gunakan 'visibleData.categories' yang sudah diurutkan dan dipotong
      data={visibleData.categories}
      renderItem={({ item: category }) => {
        const categoryProducts =
          data?.products?.filter(
            (product) => product.category === category.id
          ) || [];

        if (categoryProducts.length === 0) return null;

        return (
          <CategoryProducts
            key={category.id}
            title={category.name}
            products={categoryProducts}
            categorySlug={category.slug}
          />
        );
      }}
      onScroll={onScroll}
      scrollEventThrottle={16}
      keyExtractor={(item) => item.id.toString()}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={() =>
        loadingMore ? (
          <ActivityIndicator color="#B17457" style={{ padding: 20 }} />
        ) : null
      }
      contentContainerStyle={{ paddingBottom: 80 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#B17457"]}
          tintColor="#B17457"
        />
      }
    />
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
    marginHorizontal: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  flatListColumn: {
    justifyContent: "space-between",
    gap: 12, // Add gap between columns
  },
  flatListContent: {
    paddingBottom: 20,
    gap: 12, // Add gap between rows
  },
  // Add new style for featured products container
  featuredProducts: {
    paddingHorizontal: 10,
    gap: 12,
  },
  loadingFooter: {
    padding: 20,
    alignItems: "center",
  },
  emptyContainer: {
    width: "100%",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
});
