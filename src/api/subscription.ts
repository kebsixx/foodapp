import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../providers/auth-provider";

export const useOrderUpdateSubscription = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log("Setting up order subscription for user:", user.id);

    const subscription = supabase
      .channel(`order-updates-${user.id}`)
      .on(
        "postgres_changes",
        { 
          event: "UPDATE", 
          schema: "public", 
          table: "order",
          filter: `user=eq.${user.id}` // Only listen to current user's orders
        },
        (payload) => {
          console.log("Order update received!", payload);
          
          // Invalidate queries for orders list
          queryClient.invalidateQueries({
            queryKey: ["orders", user.id],
          });
          
          // If we have a specific order, also invalidate that
          if (payload.new && payload.new.slug) {
            queryClient.invalidateQueries({
              queryKey: ["orders", payload.new.slug],
            });
          }

          // Show console log for debugging
          if (payload.old && payload.new) {
            console.log(`Order status changed from ${payload.old.status} to ${payload.new.status}`);
          }
        }
      )
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "order",
          filter: `user=eq.${user.id}`
        },
        (payload) => {
          console.log("New order created!", payload);
          queryClient.invalidateQueries({
            queryKey: ["orders", user.id],
          });
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to order updates");
        }
      });

    return () => {
      console.log("Unsubscribing from order updates");
      subscription.unsubscribe();
    };
  }, [user?.id, queryClient]);
};

// Specific subscription for individual order details
export const useSpecificOrderSubscription = (orderSlug: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !orderSlug) return;

    console.log(`Setting up subscription for order: ${orderSlug}`);

    const subscription = supabase
      .channel(`order-detail-${orderSlug}`)
      .on(
        "postgres_changes",
        { 
          event: "UPDATE", 
          schema: "public", 
          table: "order",
          filter: `slug=eq.${orderSlug}`
        },
        (payload) => {
          console.log(`Order ${orderSlug} updated!`, payload);
          
          // Invalidate specific order query
          queryClient.invalidateQueries({
            queryKey: ["orders", orderSlug],
          });
          
          // Also invalidate the orders list
          queryClient.invalidateQueries({
            queryKey: ["orders", user.id],
          });

          // Log status change for debugging
          if (payload.old && payload.new) {
            console.log(`Order ${orderSlug} status: ${payload.old.status} → ${payload.new.status}`);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Order ${orderSlug} subscription status:`, status);
      });

    return () => {
      console.log(`Unsubscribing from order ${orderSlug}`);
      subscription.unsubscribe();
    };
  }, [orderSlug, user?.id, queryClient]);
};