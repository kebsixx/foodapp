import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";

import { ProductListItem } from "../../components/product-list-item";
import { ListHeader } from "../../components/list-header";
import { getProductsAndCategories } from "../../api/api";

const Home = () => {
  const { data, error, isLoading } = getProductsAndCategories();

  if (isLoading) return <ActivityIndicator />;

  if (error || !data)
    return <Text>{error?.message || "An error accured"}</Text>;

  return (
    <View>
      <FlatList
        data={data.products}
        renderItem={({ item }) => <ProductListItem product={item} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        ListHeaderComponent={
          <ListHeader categories={data.categories} users={data.users!} />
        }
        contentContainerStyle={styles.flatListContent}
        columnWrapperStyle={styles.flatListColumn}
        style={{ paddingHorizontal: 10, paddingVertical: 5 }}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  flatListContent: {
    paddingBottom: 20,
  },
  flatListColumn: {
    justifyContent: "space-between",
  },
});
