import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { refreshAccessToken } from "../utils/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));

  const CURRENCY_SYMBOLS = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    BGN: "лв",
    CZK: "Kč",
    DKK: "kr",
    HUF: "Ft",
    ISK: "kr",
    NOK: "kr",
    PLN: "zł",
    RON: "lei",
    SEK: "kr",
    CHF: "CHF",
    JPY: "¥",
    CAD: "C$",
    AUD: "A$",
    NZD: "NZ$",
    SGD: "S$",
    HKD: "HK$",
  };

  const SUBCATEGORY_MAPPING = {
    salary: "Salary",
    allowance: "Allowance",
    investment_gain: "Investment Gain",
    stipend: "Stipend",
    sale_proceeds: "Sale Proceeds",
    dividend: "Dividend",
    other: "Other",
    grocery: "Grocery",
    restaurant: "Restaurant",
    entertainment: "Entertainment",
    healthcare: "Healthcare",
    utility: "Utility",
    subscription: "Subscription",
    gift: "Gift",
    self_care: "Self Care",
    housing: "Housing",
    clothes: "Clothes",
    miscellaneous: "Miscellaneous",
    stock: "Stock",
    bond: "Bond",
    crypto: "Crypto",
    fund: "Fund",
    real_estate: "Real Estate",
    savings: "Savings",
  };

  useEffect(() => {
    const fetchUser = async () => {
      console.log("Token:", token);
      if (!token) {
        console.log("No token found. User is not authenticated.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get("http://127.0.0.1:8000/auth/user/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("User:", response.data);
        setUser(response.data);
      } catch (error) {
        console.error(
          "Error getting user:",
          error.response?.data || error.message
        );
        if (error.response?.status === 401) {
          console.log("Refreshing token");
          const newToken = await refreshAccessToken();
          if (newToken) {
            setToken(newToken); // update token state so the effect re-runs
            try {
              const retryResponse = await axios.get(
                "http://127.0.0.1:8000/auth/user/",
                {
                  headers: { Authorization: `Bearer ${newToken}` },
                }
              );
              console.log("User data after refresh:", retryResponse.data);
              setUser(retryResponse.data);
            } catch (retryError) {
              console.error(
                "Failed after refreshing token:",
                retryError.response?.data || retryError.message
              );
            }
          } else {
            console.log("User must log in again.");
            setAuthMessage("Session ended. Please log in again.");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const token = await refreshAccessToken();
      if (token) {
        console.log("Token auto-refreshed.");
      } else {
        console.log("Auto-refresh failed.");
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const logoutUser = () => {
    console.log("Logging out");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        CURRENCY_SYMBOLS,
        user,
        loading,
        logoutUser,
        SUBCATEGORY_MAPPING,
        authMessage,
        setToken, // Expose setToken so login can update it if needed
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
