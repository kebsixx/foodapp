import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const useStore = () => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Get initial store status
    const getStoreStatus = async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("is_open")
        .single();

      if (data) {
        setIsOpen(data.is_open!);
      }

      if (error) {
        console.error("Error fetching store status:", error);
      }
    };

    getStoreStatus();

    // Subscribe to store settings changes
    const subscription = supabase
      .channel("store_settings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "store_settings" },
        (payload) => {
          if (payload.new && "is_open" in payload.new) {
            setIsOpen(payload.new.is_open);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { isOpen };
};

export default useStore;
