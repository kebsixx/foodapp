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
};

const AuthContext = createContext<AuthData>({
  session: null,
  mounting: true,
  user: null,
  setUser: () => {},
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

  return (
    <AuthContext.Provider value={{ session, mounting, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
