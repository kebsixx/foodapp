import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  SafeAreaView,
} from "react-native";
import React from "react";
import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import { ProductListItem } from "../../components/product-list-item";
import { getCategoryAndProducts } from "../../api/api";
import { CategorySkeleton } from "../../components/category-skeleton";
import CustomHeader from "../../components/customHeader";

const Category = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data, error, isLoading, refetch } = getCategoryAndProducts(slug);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatTitle = (slug: string) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <CustomHeader title={formatTitle(slug)} />
        <CategorySkeleton />
      </SafeAreaView>
    );
  }
  if (error || !data) return <Text>Error: {error?.message}</Text>;
  if (!data.category || !data.products) return <Redirect href="/404" />;

  const { category, products } = data;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader title={category.name} />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={60}
            colors={["#B17457"]}
            tintColor="#B17457"
          />
        }>
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
    </SafeAreaView>
  );
};

export default Category;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
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
    gap: 16,
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: "space-between",
    gap: 16,
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
