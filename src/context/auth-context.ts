import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  role: "admin" | "agent" | "viewer" | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: null | { message: string } }>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
