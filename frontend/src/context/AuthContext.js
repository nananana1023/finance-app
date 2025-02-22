import { createContext, useState, useEffect } from "react";
import axios from "axios"; // ✅ Import axios

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");

      console.log("🔍 Token from localStorage:", token);

      if (!token) {
        console.log("⚠ No token found. User is not authenticated.");
        setLoading(false);
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        console.log("📡 Fetching user with headers:", headers);

        const response = await axios.get("http://127.0.0.1:8000/auth/user/", {
          headers,
        });

        console.log("✅ User data received:", response.data);
        setUser(response.data);
      } catch (error) {
        console.error(
          "❌ Error fetching user:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logoutUser = () => {
    console.log("🚪 Logging out user...");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, logoutUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
