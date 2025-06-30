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

  const sortedCategoriesForHeader = useMemo(() => {
    if (!data?.categories) return [];

    return [...data.categories].sort((a, b) => {
      const aIsSenja = a.imageUrl?.includes("ceritasenja");
      const bIsSenja = b.imageUrl?.includes("ceritasenja");
      if (aIsSenja && !bIsSenja) return 1;
      if (!aIsSenja && bIsSenja) return -1;
      return 0;
    });
  }, [data?.categories]);

  const sortedCategoriesForList = useMemo(() => {
    if (!data?.categories || !data?.products) return [];

    const countSenjaProducts = (categoryId: number) => {
      return data.products.filter(
        (p) => p.category === categoryId && p.heroImage?.includes("ceritasenja")
      ).length;
    };

    return [...data.categories].sort((a, b) => {
      const countA = countSenjaProducts(a.id);
      const countB = countSenjaProducts(b.id);
      return countA - countB;
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
    gap: 12,
  },
  flatListContent: {
    paddingBottom: 20,
    gap: 12,
  },

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
