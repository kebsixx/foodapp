import { Session } from "@supabase/supabase-js";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

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
};

type AuthData = {
  session: Session | null;
  mounting: boolean;
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  updateProfile: (updates: Partial<UserType>) => Promise<void>;
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

  // Separate session and user fetching
  const fetchUserData = async (sessionUserId: string) => {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionUserId)
        .single();

      if (error) throw error;
      setUser(user as UserType);
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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        setSession(session);
        if (session?.user?.id) {
          fetchUserData(session.user.id);
        } else {
          setUser(null);
        }
      }
    });

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
      setUser(updatedUser);
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
