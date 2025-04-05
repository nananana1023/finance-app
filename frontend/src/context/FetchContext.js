import { createContext, useContext, useState } from "react";
import MonthContext from "../context/MonthContext";
import AuthContext from "../context/AuthContext";
import api from "../utils/api";

const FetchContext = createContext();

export const FetchProvider = ({ children }) => {
  const { selectedMonth } = useContext(MonthContext);
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };

  const [summary, setSummary] = useState({
    total_expense: 0,
    total_income: 0,
    total_investment: 0,
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total_expenses, setTotalExpenses] = useState(null);
  const [pieData, setPieData] = useState([]);

  const fetchSummary = async () => {
    const [year, month] = selectedMonth.split("-");
    try {
      const response = await api.get(`monthly-summary/${year}/${month}/`);
      setSummary(response.data);
    } catch (err) {
      console.error("Error fetching monthly summary:", err);
    }
  };

  const fetchTotalExpenses = async () => {
    try {
      const response = await api.get("expenses-months/");
      setTotalExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses over months:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const profileResponse = await api.get("financial-profile/");
      setProfile(profileResponse.data[0] || null);
    } catch (error) {
      console.error(
        "Error fetching user data:",
        error.response?.data || error.message
      );
      setError("Failed to load user data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPieData = async () => {
    const [year, month] = selectedMonth.split("-");
    try {
      const response = await api.get(
        `sum-subcategories-month/${year}/${month}/`
      );
      setPieData(response.data);
    } catch (error) {
      console.error("Error fetching sum per category:", error);
    }
  };

  return (
    <FetchContext.Provider
      value={{
        summary,
        profile,
        loading,
        error,
        total_expenses,
        pieData,
        fetchSummary,
        fetchTotalExpenses,
        fetchProfile,
        fetchPieData,
      }}
    >
      {children}
    </FetchContext.Provider>
  );
};

export default FetchContext;
