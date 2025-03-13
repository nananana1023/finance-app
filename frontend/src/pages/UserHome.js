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
import PieChartContainer from "./PieChart";
import FetchContext from "../context/FetchContext";

const UserHome = () => {
  const { user, CURRENCY_SYMBOLS } = useContext(AuthContext);
  const {
    fetchSummary,
    fetchTotalExpenses,
    fetchProfile,
    fetchPieData,
    summary,
    profile,
    total_expenses,
    pieData,
  } = useContext(FetchContext);

  const { selectedMonth, setSelectedMonth, handleNextMonth, handlePrevMonth } =
    useContext(MonthContext);

  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };
  const location = useLocation();
  const navigate = useNavigate();
  const isDataEmpty =
    summary.total_expense === 0 &&
    summary.total_income === 0 &&
    summary.total_investment === 0;

  useEffect(() => {
    fetchPieData();
    fetchProfile();
    fetchSummary();
    fetchTotalExpenses();
  }, [user, selectedMonth]);

  const data = [
    { category: "Expense", amount: summary.total_expense, color: "#ec7063" },
    { category: "Income", amount: summary.total_income, color: "#17a589" },
    { category: "Savings", amount: summary.total_investment, color: "#5dade2" },
  ];

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

      <div style={{ marginLeft: 70, display: "flex", alignItems: "center" }}>
        <button onClick={handlePrevMonth}>{"<"}</button>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ margin: "0 10px" }}
        />
        <button onClick={handleNextMonth}>{">"}</button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-start",
        }}
      >
        {/* Bar Chart Container */}
        <div style={{ width: "50%" }}>
          {!isDataEmpty ? (
            <ResponsiveContainer width="100%" height={400}>
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

        {/* Pie Chart Container */}
        <div style={{ width: "50%" }}>
          <PieChartContainer data={pieData} />
        </div>
      </div>
    </div>
  );
};

export default UserHome;
