import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
// import { useAuth } from "@/hooks/use-auth";
import UserMenu from "./user-menu";

export function HeaderUserArea() {
  const isAuthenticated = true;

  return isAuthenticated ? (
    <UserMenu />
  ) : (
    <Link to="/login">
      <Button variant="outline" size="sm">Login</Button>
    </Link>
  );
}

export default HeaderUserArea;