import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export const getProductsAndCategories = () => {
  return useQuery({
    queryKey: ["products", "categories"],
    queryFn: async () => {
      const [products, categories] = await Promise.all([
        supabase.from("products").select("*"),
        supabase.from("categories").select("*"),
      ]);

      if (products.error || categories.error) {
        throw new Error("Failed to fetch products and categories");
      }

      return {
        products: products.data,
        categories: categories.data,
      };
    },
  });
};
