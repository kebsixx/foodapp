import { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { ProductListItem } from "../../components/product-list-item";
import { ListHeader } from "../../components/list-header";
import { getProductsAndCategories } from "../../api/api";
import { CategoryProducts } from "../../components/category-products";

const Home = () => {
  const { data, error, isLoading, refetch } = getProductsAndCategories();
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState(2);
  const [loadingMore, setLoadingMore] = useState(false);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
      setVisibleCategories(2); // Reset on refresh
    } finally {
      setRefreshing(false);
    }
  };

  const onEndReached = useCallback(() => {
    if (
      !loadingMore &&
      data?.categories &&
      visibleCategories < data.categories.length
    ) {
      setLoadingMore(true);
      setTimeout(() => {
        setVisibleCategories((prev) =>
          Math.min(prev + 2, data.categories.length)
        );
        setLoadingMore(false);
      }, 500);
    }
  }, [data?.categories, visibleCategories, loadingMore]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="large" color="#B17457" />
      </View>
    );
  }

  if (error || !data)
    return <Text>{error?.message || "An error occurred"}</Text>;

  const visibleData = {
    ...data,
    categories: data.categories.slice(0, visibleCategories),
  };

  return (
    <FlatList
      style={styles.container}
      ListHeaderComponent={() => (
        <>
          <ListHeader categories={data.categories} users={data.users!} />

          {/* Best Seller Menu Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Best Seller Menu</Text>
            <FlatList
              data={data.products.slice(0, 6)}
              renderItem={({ item }) => <ProductListItem product={item} />}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.flatListColumn}
              contentContainerStyle={styles.featuredProducts}
            />
          </View>
        </>
      )}
      data={visibleData.categories}
      renderItem={({ item: category }) => {
        const categoryProducts = data.products.filter(
          (product) => product.category === category.id
        );

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
      keyExtractor={(item) => item.id.toString()}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={() =>
        loadingMore ? (
          <ActivityIndicator color="#B17457" style={{ padding: 20 }} />
        ) : null
      }
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
});
