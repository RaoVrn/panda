import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";
import type { AuthStatus } from "@/features/user/types";

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  userId: string | null;
  configured: boolean;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within <AuthProvider>");
  return value;
}
