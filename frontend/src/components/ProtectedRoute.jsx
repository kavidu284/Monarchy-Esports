
import { Navigate } from "react-router-dom";
import { getValidAdminToken } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const token = getValidAdminToken();

  if (!token) {
    return <Navigate to="/admin/login" />;
  }

  return children;
}
