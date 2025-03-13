import { createContext, useContext, useState } from "react";
import axios from "axios";
import MonthContext from "../context/MonthContext";
import AuthContext from "../context/AuthContext";

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
      const response = await axios.get(
        `http://127.0.0.1:8000/api/monthly-summary/${year}/${month}/`,
        { headers }
      );
      setSummary(response.data);
    } catch (err) {
      console.error("Error fetching monthly summary:", err);
    }
  };

  const fetchTotalExpenses = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/expenses-months`,
        { headers }
      );
      setTotalExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses over months:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const profileResponse = await axios.get(
        "http://127.0.0.1:8000/api/financial-profile/",
        { headers }
      );
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
      const response = await axios.get(
        `http://127.0.0.1:8000/api/sum-subcategories-month/${year}/${month}/`,
        { headers }
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
