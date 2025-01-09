import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const useStore = () => {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
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

    // Check time-based rules
    const checkStoreHours = () => {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      // Compare with store hours
    };

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);
  return { isOpen };
};
