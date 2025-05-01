import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
} from "react-native";
import { ProductListItem } from "../../components/product-list-item";
import { ListHeader } from "../../components/list-header";
import { getProductsAndCategories } from "../../api/api";
import { useState } from "react";
import { ProductSkeleton } from "../../components/product-skeleton";

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

  if (isLoading && !refreshing) {
    return (
      <View style={styles.container}>
        <FlatList
          data={[1, 2, 3, 4, 5, 6]} // Number of skeleton items to show
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
    <View style={styles.container}>
      <FlatList
        data={data.products}
        renderItem={({ item }) => <ProductListItem product={item} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        ListHeaderComponent={
          <ListHeader categories={data.categories} users={data.users!} />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#B17457"]}
            tintColor="#B17457"
          />
        }
        contentContainerStyle={[styles.flatListContent, { paddingBottom: 80 }]}
        columnWrapperStyle={styles.flatListColumn}
        style={{ paddingHorizontal: 10, paddingVertical: 5 }}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  flatListColumn: {
    justifyContent: "space-between",
  },
});
