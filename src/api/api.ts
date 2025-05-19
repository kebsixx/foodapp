import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../providers/auth-provider";
import { generateOrderSlug } from "../utils/utils";

type PickupMethod = 'pickup' | 'delivery';
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

// Update the Order interface to match your exact database schema
interface DatabaseOrder {
  id?: number;
  created_at?: string;
  status: string;
  description: string | null;
  user: string;        // Changed back to 'user'
  slug: string;
  totalPrice: number;
  pickup_method: string | null;
  payment_proof: string | null;
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
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('order')
        .select(`
          id,
          slug,
          status,
          created_at,
          totalPrice,
          order_item (
            product (
              title
            ),
            variant_id
          )
        `)
        .eq('user', user.id)  // Changed from 'user' to 'user_id'
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(order => ({
        id: order.id,
        slug: order.slug,
        status: order.status,
        created_at: order.created_at,
        totalPrice: order.totalPrice,
        product_title: order.order_item?.[0]?.product?.title || 'Unknown Product',
        variant: order.order_item?.[0]?.variant_id || null
      })) || [];
    },
    enabled: !!user
  });
};

export const createOrder = () => {
  const { user } = useAuth();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const slug = generateOrderSlug();
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({ totalPrice }: { totalPrice: number }) {
      const { data, error } = await supabase
        .from("order")
        .insert({
          totalPrice,
          slug,
          user: user.id,
          status: "Pending",
        })
        .select("*")
        .single();

      if (error) {
        console.error("Order creation error details:", error);
        throw new Error("Failed to create order: " + error.message);
      }

      return data;
    },

    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["order"] });
      await queryClient.invalidateQueries({ queryKey: ["orders", user.id] });
    },
    onError(error) {
      // Handle errors gracefully
      console.error('Order creation failed:', error);
    }
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
  const { user } = useAuth();

  if (!user) {
    throw new Error("User not authenticated");
  }

  return useQuery({
    queryKey: ["orders", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order")
        .select("*, order_item:order_item(*, products:product(*))")
        .eq("slug", slug)
        .eq("user", user.id)
        .single();

      if (error || !data) {
        throw new Error("Gagal mengambil order: " + error?.message);
      }

      return data;
    },
  });
};
