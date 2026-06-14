import { createContext } from "react";
import type { CustomerUser } from "../../types";

export const AuthContext = createContext<{
  user: CustomerUser | null;
  authChecking: boolean;
  setUser: (user: CustomerUser | null) => void;
  signOut: () => Promise<void>;
}>({
  user: null,
  authChecking: false,
  setUser: () => undefined,
  signOut: async () => undefined,
});
