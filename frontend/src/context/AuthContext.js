import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { refreshAccessToken } from "../utils/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      let token = localStorage.getItem("accessToken");

      console.log("Checking token before request:", token);

      if (!token) {
        console.log("⚠ No token found. User is not authenticated.");
        setLoading(false);
        return;
      }

      try {
        console.log("📡 Fetching user data...");
        const response = await axios.get("http://127.0.0.1:8000/auth/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("User data received:", response.data);
        setUser(response.data);
      } catch (error) {
        console.error(
          "Error fetching user:",
          error.response?.data || error.message
        );

        if (error.response?.status === 401) {
          console.log("🔄 Token expired. Refreshing...");
          token = await refreshAccessToken();

          if (token) {
            try {
              const retryResponse = await axios.get(
                "http://127.0.0.1:8000/auth/user/",
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              console.log(
                "User data received after refresh:",
                retryResponse.data
              );
              setUser(retryResponse.data);
            } catch (retryError) {
              console.error(
                "Failed after refreshing token:",
                retryError.response?.data || retryError.message
              );
            }
          } else {
            console.log("User must log in again.");
          }
        }
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
    <AuthContext.Provider value={{ user, loading, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
