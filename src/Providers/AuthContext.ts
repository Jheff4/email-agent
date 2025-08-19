import { User } from "@/api/types";
import { createContext } from "react";

interface Auth {
  authenticated: boolean;
  user?: User;
  isLoading: boolean;
  refetch: () => any;
}

export const AuthContext = createContext<Auth>({
  authenticated: false,
  isLoading: true,
  refetch: () => {},
});
