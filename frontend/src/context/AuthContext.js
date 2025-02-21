import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Function to login a user
  const loginUser = async (username, password, navigate) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/login/", {
        username,
        password,
      });

      // Store tokens in localStorage
      localStorage.setItem("token", response.data.access);
      setToken(response.data.access);
      setUser({ username });

      navigate("/dashboard"); // Redirect to dashboard
    } catch (error) {
      console.log("Login failed:", error.response?.data);

      // Throw error to be caught in Login.js
      throw new Error(
        error.response?.data?.error || "Invalid username or password."
      );
    }
  };

  // Function to logout
  const logoutUser = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token"); // Remove token from storage
  };

  // Fetch user details if token exists
  useEffect(() => {
    if (token) {
      axios
        .get("http://127.0.0.1:8000/auth/users/me/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setUser(response.data))
        .catch(() => logoutUser());
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
