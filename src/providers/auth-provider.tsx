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
        setMounting(true);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        setSession(session);

        if (session?.user?.id) {
          const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (userError) throw userError;
          setUser(user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setSession(null);
        setUser(null);
      } finally {
        setMounting(false);
      }
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setMounting(true);
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
        console.error("Auth state change error:", error);
        setUser(null);
      } finally {
        setMounting(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const updateProfile = async (updates: any) => {
    try {
      if (!user?.id) return;

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
