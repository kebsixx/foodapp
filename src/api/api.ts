import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/auth-provider";
import { generateOrderSlug } from "../utils/utils";

interface OrderItem {
  id?: number;
  order: number;
  product: number;
  quantity: number;
  variant?: string | null;
  products?: {
    id: number;
    title: string;
    price: number | null;
    heroImage: string;
  };
}

interface Order {
  id: number;
  slug: string;
  status: string;
  created_at: string;
  totalPrice: number;
  user: string;
  order_item: OrderItem[];
}

export const getUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        throw new Error("Failed to fetch users : " + error?.message);
      }
      return data;
    }
  })
};

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
    enabled: !!id,
    queryKey: ["orders", id],
    queryFn: async () => {
      // Pertama ambil data order
      const { data: orders, error: ordersError } = await supabase
        .from("order")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("user", id);

      if (ordersError) {
        throw new Error("Gagal mengambil orders: " + ordersError?.message);
      }

      // Kemudian ambil order items untuk setiap order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const { data: orderItems, error: itemsError } = await supabase
            .from("order_item")
            .select("*, products:product(*)")
            .eq("order", order.id);

          if (itemsError) {
            console.error("Error fetching order items:", itemsError);
            return { ...order, order_item: [] };
          }

          return {
            ...order,
            order_item: orderItems.map(item => ({
              ...item,
              variant: (item as any).variant ? JSON.parse((item as any).variant) : null
            }))          };
        })
      );

      // Transform data untuk tampilan
      const transformedOrders = ordersWithItems.flatMap(order => {
        return order.order_item.map(item => {
          const variantPrice = item.variant?.price || item.products?.price || 0;
          return {
            ...order,
            id: `${order.id}-${item.id}`,
            order_item: [item],
            product_title: `${item.products?.title}${item.variant?.name ? ` (${item.variant.name})` : ''}`,
            variant: item.variant?.name || null,
            totalPrice: parseFloat(variantPrice.toString()) * item.quantity
          };
        });
      });

      return transformedOrders;
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
      await queryClient.invalidateQueries({ queryKey: ["orders", id] });
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
        variant?: {
          id: string;
          name: string;
          price: number;
        } | null;
      }[]
    ) => {
      const { data, error } = await supabase
        .from("order_item")
        .insert(
          insertData.map(({ orderId, quantity, productId, variant }) => ({
            order: orderId,
            product: productId,
            quantity,
            variant: variant ? variant.name : null,
          }))
        )
        .select("*");

      // ... rest of the function
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
        throw new Error("Gagal mengambil order: " + error?.message);
      }

      return data;
    },
  });
};
