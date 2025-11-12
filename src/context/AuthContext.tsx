import { useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"admin" | "agent" | "viewer" | null>(null);

  useEffect(() => {
    const handleAuthStateChange = async (session: Session | null) => {
      // Atualiza sessão e usuário imediatamente
      setSession(session);
      const currentUser = session?.user;
      setUser(currentUser ?? null);

      // Não bloquear a UI esperando a consulta de perfil/role
      setLoading(false);

      // Buscar role em background; caso falhe, manter role como null
      if (currentUser) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .single();
          setRole((profile?.role as "admin" | "agent" | "viewer") ?? null);
        } catch (_err) {
          setRole(null);
        }
      } else {
        setRole(null);
      }
    };

    const fetchSession = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await handleAuthStateChange(session);
    };

    fetchSession();

    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await handleAuthStateChange(session);
    });

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? { message: error.message } : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo<AuthContextValue>(
    () => ({ session, user, loading, role, isAdmin: role === "admin", signIn, signOut }),
    [session, user, loading, role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};