import { clearAuth } from "./auth";
import toast from "react-hot-toast";

export const logout = (navigate) => {
  clearAuth();
  toast.success("Logged out successfully");
  if (typeof navigate === "function") {
    navigate("/login");
  } else {
    window.location.href = "/login";
  }
};
