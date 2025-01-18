import { Session } from "@supabase/supabase-js";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

type AuthData = {
  session: Session | null;
  mounting: boolean;
  user: any;
  setUser: (user: any) => void;
  updateProfile: (updates: any) => Promise<void>;
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
  const [user, setUser] = useState<{
    avatar_url: string;
    create_at: string | null;
    email: string;
    expo_notification_token: string | null;
    id: string;
    type: string | null;
  } | null>(null);
  const [mounting, setMounting] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setMounting(true); // Ensure mounting is true at start

        const {
          data: { session },
        } = await supabase.auth.getSession();

        setSession(session);

        if (session?.user?.id) {
          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) throw error;
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log("Error fetching session:", error);
        setUser(null);
      } finally {
        setMounting(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setMounting(true);

        if (session?.user?.id) {
          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) {
            setUser(null);
          } else {
            setUser(user);
          }
        } else {
          setUser(null);
        }
        setMounting(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const updateProfile = async (updates: any) => {
    try {
      if (!user?.id) return;

      // First upload the avatar if it's a new file
      let avatar_url = updates.avatar_url;
      if (updates.avatar_url && updates.avatar_url.startsWith("file://")) {
        const fileName = `avatar-${user.id}-${Date.now()}`;
        const response = await fetch(updates.avatar_url);
        const blob = await response.blob();

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(fileName);

        avatar_url = publicUrl;
      }

      // Update the user profile
      const { error } = await supabase
        .from("users")
        .update({
          ...updates,
          avatar_url,
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
