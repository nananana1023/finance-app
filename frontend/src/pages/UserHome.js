import { useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Legend,
  Cell,
} from "recharts";
import Header from "../components/Header";

const UserHome = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  ); // Default to current month
  const [summary, setSummary] = useState({
    total_expense: 0,
    total_income: 0,
    total_investment: 0,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const isDataEmpty =
    summary.total_expense === 0 &&
    summary.total_income === 0 &&
    summary.total_investment === 0;

  useEffect(() => {
    const fetchSummary = async () => {
      const [year, month] = selectedMonth.split("-");

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/monthly-summary/${year}/${month}/`,
          { headers }
        );
        setSummary(response.data);
      } catch (error) {
        console.error("Error fetching monthly summary:", error);
      }
    };

    const fetchProfile = async () => {
      console.log("Token from localStorage:", token);
      console.log("User data from AuthContext:", user);

      if (!token) {
        setError("User is not authenticated.");
        setLoading(false);
        return;
      }

      if (!user) {
        return;
      }

      try {
        const profileResponse = await axios.get(
          "http://127.0.0.1:8000/api/financial-profile/",
          { headers }
        );
        console.log("Financial profile API Response:", profileResponse.data);

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

    fetchProfile();
    fetchSummary();
  }, [user, selectedMonth]);

  const data = [
    { category: "Expense", amount: summary.total_expense, color: "#ec7063" },
    { category: "Income", amount: summary.total_income, color: "#17a589" },
    { category: "Savings", amount: summary.total_investment, color: "#5dade2" },
  ];

  return (
    <div>
      <Header />
      <div className="success-container">
        <p>{location.state?.message || null}</p>
      </div>
      {/* month choose */}
      <h2>Monthly Financial Overview</h2>
      <label>Select Month:</label>
      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
      />
      {!isDataEmpty ? (
        // bar chart - sum of categories
        <ResponsiveContainer width="50%" height={400}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="category" />
            <YAxis hide />
            <Tooltip />

            <Bar dataKey="amount">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList dataKey="amount" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p>No transactions recorded for this month.</p>
      )}
    </div>
  );
};

export default UserHome;
