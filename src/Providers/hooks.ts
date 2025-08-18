import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export const useAuthProvider = () => useContext(AuthContext);
