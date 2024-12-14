import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/auth-provider";
import { generateOrderSlug } from "../utils/utils";

export const getProductsAndCategories = () => {
  return useQuery({
    queryKey: ["products", "categories", "users"],
    queryFn: async () => {
      const [products, categories, users] = await Promise.all([
        supabase.from("product").select("*"),
        supabase.from("category").select("*"),
        supabase.from("users").select("*"),
      ]);

      if (products.error || categories.error) {
        throw new Error("Failed to fetch products and categories");
      }

      return {
        products: products.data,
        categories: categories.data,
        users: users.data,
      };
    },
  });
};

export const getProduct = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        throw new Error("Failed to fetch product : " + error?.message);
      }

      return data;
    },
  });
};

export const getCategoryAndProducts = (categorySlug: string) => {
  return useQuery({
    queryKey: ["categoryAndProducts", categorySlug],
    queryFn: async () => {
      const { data: category, error: categoryError } = await supabase
        .from("category")
        .select("*")
        .eq("slug", categorySlug)
        .single();

      if (categoryError || !category) {
        throw new Error("Failed to fetch category : " + categoryError?.message);
      }

      const { data: products, error: productsError } = await supabase
        .from("product")
        .select("*")
        .eq("category", category.id);

      if (productsError) {
        throw new Error("Failed to fetch products : " + productsError?.message);
      }

      return {
        category,
        products,
      };
    },
  });
};

export const getMyOrders = () => {
  const {
    user: { id },
  } = useAuth();

  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("user", id);

      if (error) {
        throw new Error("Failed to fetch orders : " + error?.message);
      }

      return data;
    },
  });
};

export const createOrder = () => {
  const {
    user: { id },
  } = useAuth();

  const slug = generateOrderSlug();

  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({ totalPrice }: { totalPrice: number }) {
      const { data, error } = await supabase
        .from("order")
        .insert({
          totalPrice,
          slug,
          user: id,
          status: "Pending",
        })
        .select("*")
        .single();

      if (error) {
        throw new Error("Failed to create order : " + error.message);
      }

      return data;
    },

    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
};

export const createOrderItem = () => {
  return useMutation({
    mutationFn: async (
      insertData: {
        productId: number;
        quantity: number;
        orderId: number;
      }[]
    ) => {
      const { data, error } = await supabase
        .from("order_item")
        .insert(
          insertData.map(({ orderId, quantity, productId }) => {
            return {
              order: orderId,
              product: productId,
              quantity,
            };
          })
        )
        .select("*");

      const productQuantities = insertData.reduce(
        (acc, { productId, quantity }) => {
          if (!acc[productId]) {
            acc[productId] = 0;
          }
          acc[productId] += quantity;
          return acc;
        },
        {} as Record<number, number>
      );

      await Promise.all(
        Object.entries(productQuantities).map(([productId, totalQuantity]) =>
          supabase.rpc("decrement_product_quantity", {
            product_id: Number(productId),
            quantity: totalQuantity,
          })
        )
      );

      if (error) {
        throw new Error("Failed to create order item : " + error?.message);
      }

      return data;
    },
  });
};

export const getMyOrder = (slug: string) => {
  const {
    user: { id },
  } = useAuth();

  return useQuery({
    queryKey: ["orders", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order")
        .select("*, order_item:order_item(*, products:product(*))")
        .eq("slug", slug)
        .eq("user", id)
        .single();

      if (error || !data) {
        throw new Error("Failed to fetch order : " + error?.message);
      }

      return data;
    },
  });
};
