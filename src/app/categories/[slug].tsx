import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import React from "react";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { ProductListItem } from "../../components/product-list-item";
import { getCategoryAndProducts } from "../../api/api";
import { CategorySkeleton } from "../../components/category-skeleton";

const Category = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data, error, isLoading, refetch } = getCategoryAndProducts(slug);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTitle: () => (
              <View style={styles.headerSkeleton}>
                <View style={styles.headerTitleSkeleton} />
              </View>
            ),
          }}
        />
        <CategorySkeleton />
      </View>
    );
  }
  if (error || !data) return <Text>Error: {error?.message}</Text>;
  if (!data.category || !data.products) return <Redirect href="/404" />;

  const { category, products } = data;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          progressViewOffset={60}
          colors={["#B17457"]}
          tintColor="#B17457"
        />
      }>
      <Stack.Screen options={{ title: category.name }} />
      <Image source={{ uri: category.imageUrl }} style={styles.categoryImage} />
      <Text style={styles.categoryName}>{category.name}</Text>
      <FlatList
        data={products}
        scrollEnabled={false}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductListItem product={item} />}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productsList}
        ListEmptyComponent={
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 16 }}>No products found</Text>
          </View>
        }
      />
    </ScrollView>
  );
};

export default Category;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  categoryImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  productsList: {
    flexGrow: 1,
  },
  productRow: {
    justifyContent: "space-between",
  },
  productContainer: {
    flex: 1,
    margin: 8,
  },
  productImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
    borderRadius: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  productPrice: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  headerSkeleton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleSkeleton: {
    width: 120,
    height: 20,
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
  },
});
