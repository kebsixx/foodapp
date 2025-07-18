import { Session } from "@supabase/supabase-js";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import * as Notifications from "expo-notifications";

type UserType = {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  gender: boolean | null;
  type: string | null;
  create_at: string | null;
  updated_at: string | null;
  expo_notification_token: string | null;
  avatar_url: string | null;
};

type AuthData = {
  session: Session | null;
  mounting: boolean;
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  updateProfile: (updates: Partial<UserType>) => Promise<void>;
  profile?: UserType | null; // Optional for backward compatibility
};

const AuthContext = createContext<AuthData>({
  session: null,
  mounting: true,
  user: null,
  setUser: () => {},
  updateProfile: async () => {},
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [mounting, setMounting] = useState(true);

  const handleAuthChange = async (_event: string, session: Session | null) => {
    try {
      // 1. Handle logout case
      if (!session) {
        // Clear token dari database saat logout
        if (user?.id) {
          await supabase
            .from("users")
            .update({ expo_notification_token: null })
            .eq("id", user.id);
        }
        setUser(null);
        setSession(null);
        return;
      }

      // 2. Handle login case
      setSession(session);
      await fetchUserData(session.user.id);

      // 3. Generate dan simpan token baru
      const newToken = await Notifications.getExpoPushTokenAsync();
      if (newToken.data) {
        await supabase
          .from("users")
          .update({ expo_notification_token: newToken.data })
          .eq("id", session.user.id);

        // Update local state
        setUser((prev) =>
          prev ? { ...prev, expo_notification_token: newToken.data } : null
        );
      }
    } catch (error) {
      console.error("Auth state change error:", error);
    }
  };

  // Separate session and user fetching
  const fetchUserData = async (sessionUserId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionUserId)
        .single();

      if (error) throw error;

      // Set user data directly
      setUser(userData as UserType);
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get stored session first
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (mounted) {
          if (error) throw error;
          setSession(session);

          // Fetch user data if session exists
          if (session?.user?.id) {
            fetchUserData(session.user.id);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        if (mounted) setMounting(false);
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const updateProfile = async (updates: Partial<UserType>) => {
    try {
      if (!user?.id) return;

      // Update the user profile
      const { error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      // Fetch and set the updated user data
      const { data: updatedUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (fetchError) throw fetchError;
      setUser(updatedUser as UserType);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ session, mounting, user, setUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
