import { useAuth } from "@/hooks/use-auth";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(true);
  const { data: user, isLoading, refetch } = useAuth();

  useEffect(() => {
    if (!user && !isLoading) {
      setAuthenticated(false);
    }
  }, [user, isLoading]);

  const value = useMemo(
    () => ({ authenticated, user, isLoading, refetch }),
    [authenticated, user, isLoading, refetch]
  );
  console.log("user", user, isLoading, value, refetch);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
