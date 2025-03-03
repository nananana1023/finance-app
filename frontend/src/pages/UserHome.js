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
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import Header from "../components/Header";
import MonthContext from "../context/MonthContext";

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

const UserHome = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedMonth, setSelectedMonth } = useContext(MonthContext);
  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };
  const [summary, setSummary] = useState({
    total_expense: 0,
    total_income: 0,
    total_investment: 0,
  });
  const [total_expenses, setTotalExpenses] = useState(null);
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

    // fetchCatSum =  async () => {
    //   const [year, month] = selectedMonth.split("-");

    //   //

    //   try {
    //     const response = await axios.get(
    //       `http://127.0.0.1:8000/api/sum-cat-month/${cat}/${year}/${month}/`,
    //       { headers }
    //     );
    //     //setCatSum(response.data);
    //   } catch (error) {
    //     console.error("Error fetching category sum:", error);
    //   }
    // };

    const fetchTotalExpenses = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/expenses-months`,
          { headers }
        );

        setTotalExpenses(response.data);
        console.log("total expenses: ", total_expenses);
      } catch (error) {
        console.error("Error fetching expenses over months:", error);
      }
    };

    const fetchProfile = async () => {
      console.log("Token from localStorage:", token);
      console.log("User data from AuthContext:", user);

      try {
        const profileResponse = await axios.get(
          "http://127.0.0.1:8000/api/financial-profile/",
          { headers }
        );
        console.log("Financial profile:", profileResponse.data);

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
    fetchTotalExpenses();
  }, [user, selectedMonth]);

  const data = [
    { category: "Expense", amount: summary.total_expense, color: "#ec7063" },
    { category: "Income", amount: summary.total_income, color: "#17a589" },
    { category: "Savings", amount: summary.total_investment, color: "#5dade2" },
  ];

  const formatMonth = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split("-");
    const currentDate = new Date(parseInt(year), parseInt(month) - 1);
    currentDate.setMonth(currentDate.getMonth() - 1);
    setSelectedMonth(formatMonth(currentDate));
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split("-");
    const currentDate = new Date(parseInt(year), parseInt(month) - 1);
    currentDate.setMonth(currentDate.getMonth() + 1);
    setSelectedMonth(formatMonth(currentDate));
  };

  const CustomXAxisTick = ({ x, y, payload, data }) => {
    const { index, value } = payload;
    const currentDataItem = data[index];

    return (
      <g transform={`translate(${x},${y})`}>
        {/* Always show month */}
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#666">
          {value}
        </text>

        {/* Only show year below january */}
        {value === "January" && (
          <text x={0} y={0} dy={32} textAnchor="middle" fill="#666">
            {currentDataItem?.year}
          </text>
        )}
      </g>
    );
  };

  return (
    <div>
      <Header />
      <div className="success-container">
        <p>{location.state?.message || null}</p>
      </div>

      {/* line chart - expenses over months */}

      <div>
        <h2>Total expense </h2>
        <ResponsiveContainer width="80%" height={400}>
          <LineChart
            data={total_expenses}
            margin={{ top: 20, right: 30, left: 60, bottom: 50 }}
          >
            <XAxis
              dataKey="month_name"
              padding={{ left: 50, right: 50 }}
              tick={<CustomXAxisTick data={total_expenses} />}
            />
            <YAxis hide />
            <ReferenceLine
              y={profile?.monthly_spending_goal}
              stroke="red"
              label={({ viewBox }) => {
                const { x, y } = viewBox;
                return (
                  <text x={x} y={y - 10} textAnchor="middle" fill="red">
                    {profile?.monthly_spending_goal}
                    {CURRENCY_SYMBOLS[profile?.currency] || profile?.currency}
                  </text>
                );
              }}
            />

            <Line
              type="linear"
              dataKey="amount"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            >
              <LabelList
                dataKey="amount"
                position="top"
                formatter={(value) =>
                  `${value}${
                    CURRENCY_SYMBOLS[profile?.currency] || profile?.currency
                  }`
                }
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* select month  */}

      <div style={{ marginLeft: 50, display: "flex", alignItems: "center" }}>
        <button onClick={handlePrevMonth}>{"<"}</button>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ margin: "0 10px" }}
        />
        <button onClick={handleNextMonth}>{">"}</button>
      </div>

      <div>
        {!isDataEmpty ? (
          // bar chart - sum of categories
          <ResponsiveContainer marginLeft={50} width="50%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="category" />
              <YAxis hide />
              <Bar dataKey="amount">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="amount"
                  position="top"
                  formatter={(value) =>
                    `${value}${
                      CURRENCY_SYMBOLS[profile.currency] || profile.currency
                    }`
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>No transactions recorded for this month.</p>
        )}
      </div>
    </div>
  );
};

export default UserHome;
