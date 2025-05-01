import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  ScrollView,
} from "react-native";
import { ProductListItem } from "../../components/product-list-item";
import { ListHeader } from "../../components/list-header";
import { getProductsAndCategories } from "../../api/api";
import { useState } from "react";
import { ProductSkeleton } from "../../components/product-skeleton";
import { CategoryProducts } from "../../components/category-products";

const Home = () => {
  const { data, error, isLoading, refetch } = getProductsAndCategories();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  // Get featured/newest products (first 6)
  const featuredProducts = data?.products.slice(0, 6) || [];

  if (isLoading && !refreshing) {
    return (
      <View style={styles.container}>
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          renderItem={() => <ProductSkeleton />}
          keyExtractor={(item) => item.toString()}
          numColumns={2}
          contentContainerStyle={[
            styles.flatListContent,
            { paddingBottom: 80 },
          ]}
          columnWrapperStyle={styles.flatListColumn}
          style={{ paddingHorizontal: 10, paddingVertical: 5 }}
        />
      </View>
    );
  }

  if (error || !data)
    return <Text>{error?.message || "An error occurred"}</Text>;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#B17457"]}
          tintColor="#B17457"
        />
      }>
      <ListHeader categories={data.categories} users={data.users!} />

      {/* Featured Products Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Products</Text>
        <FlatList
          data={featuredProducts}
          renderItem={({ item }) => <ProductListItem product={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={styles.flatListColumn}
          contentContainerStyle={styles.featuredProducts} // Add this line
          style={{ flex: 1 }} // Change from paddingHorizontal to flex
        />
      </View>

      {/* Categories Sections */}
      {data.categories.map((category) => {
        const categoryProducts = data.products.filter(
          (product) => product.category === category.id
        );

        if (categoryProducts.length === 0) return null;

        return (
          <CategoryProducts
            key={category.id}
            title={category.name}
            products={categoryProducts}
          />
        );
      })}
    </ScrollView>
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    paddingHorizontal: 16,
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
});
