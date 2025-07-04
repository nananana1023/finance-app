import { useEffect, useState, useContext } from "react";
import React from "react";
import AuthContext from "../context/AuthContext";
import Header from "../components/Header";
import "../index.css";
import FetchContext from "../context/FetchContext";
import { Container, Card } from "react-bootstrap";
import api from "../utils/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Form, Button, InputGroup } from "react-bootstrap";
import MonthContext from "../context/MonthContext";

const Insights = () => {
  const {
    fetchSummary,
    fetchProfile,
    fetchPieData,
    summary,
    profile,
    pieData,
  } = useContext(FetchContext);
  const { user, CURRENCY_SYMBOLS, authMessage, SUBCATEGORY_MAPPING } =
    useContext(AuthContext);
  const [avg, setAvg] = useState(null);
  const currentDate = new Date().getDate();
  const { selectedMonth, setSelectedMonth, handleNextMonth, handlePrevMonth } =
    useContext(MonthContext);

  useEffect(() => {
    const fetchAvgAmounts = async () => {
      try {
        const response = await api.get("avg-subcategories/");
        setAvg(response.data);
        console.log("Average expense per subcategory: ", response.data);
      } catch (error) {
        console.error("Error fetching average amounts:", error);
      }
    };

    fetchProfile();
    fetchSummary();
    fetchAvgAmounts();
    fetchPieData();
  }, [user, selectedMonth]);

  const invest_goal_amount = profile
    ? (parseInt(profile.savings_percent.slice(0, 2), 10) / 100) *
      summary.total_income
    : null;

  const exceededSpendingGoal =
    profile && summary.total_expense > profile.monthly_spending_goal;

  const expenseData =
    pieData && avg
      ? pieData.filter(
          (item) =>
            item.category === "expense" &&
            avg.find((a) => a.subcategory === item.subcategory)
        )
      : [];

  const chartData = expenseData
    .map((item) => {
      const avgItem = avg.find((a) => a.subcategory === item.subcategory);
      if (avgItem && avgItem.average > 0 && item.total_amount > avgItem.average)
        return {
          name:
            SUBCATEGORY_MAPPING[item.subcategory?.toLowerCase()?.trim()] ||
            item.subcategory,
          averageSpending: parseFloat(avgItem.average.toFixed(2)),
          thisMonthSpending: item.total_amount,
        };
    })
    .filter(Boolean);

  console.log(chartData);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        fontFamily: "monospace",
      }}
    >
      <Header />
      <Container className="py-5">
        {authMessage && <div className="alert alert-danger">{authMessage}</div>}
        <h3 className="text-center mb-4" style={{ color: "black" }}>
          Financial Insights
        </h3>

        {/* month selector */}
        <InputGroup className="mb-5" style={{ maxWidth: "300px" }}>
          <Button variant="outline-secondary" onClick={handlePrevMonth}>
            &lt;
          </Button>
          <Form.Control
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <Button variant="outline-secondary" onClick={handleNextMonth}>
            &gt;
          </Button>
        </InputGroup>

        <Card
          className="mb-4"
          style={{
            border: exceededSpendingGoal ? "2px solid red" : "none",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <Card.Body style={{ backgroundColor: "#E9E9DF", color: "black" }}>
            {profile && exceededSpendingGoal && (
              <p style={{ fontWeight: "bold", color: "red" }}>
                Alert: You exceeded your monthly spending goal by{" "}
                {(
                  summary.total_expense - profile.monthly_spending_goal
                ).toFixed(2)}
                {CURRENCY_SYMBOLS[profile.currency]}.
              </p>
            )}
            {profile &&
              summary.total_investment < invest_goal_amount &&
              currentDate > 15 && (
                <p style={{ fontWeight: "bold", color: "orange" }}>
                  Warning: You invested {summary.total_investment}
                  {CURRENCY_SYMBOLS[profile.currency]} this month which is less
                  than your goal.
                </p>
              )}
            {profile && !exceededSpendingGoal && summary.total_expense > 0 && (
              <p style={{ fontWeight: "bold", color: "green" }}>
                You are on track with your monthly spending goal — great job!
              </p>
            )}
            {profile && summary.total_expense === 0 && (
              <p style={{ fontWeight: "bold" }}>No transactions found.</p>
            )}
          </Card.Body>
        </Card>

        {/* spending comparison */}
        {chartData && chartData.length > 0 && (
          <Card
            className="mb-4"
            style={{ borderRadius: "8px", overflow: "hidden" }}
          >
            <Card.Body style={{ backgroundColor: "#F7F7F7", color: "black" }}>
              <h5 className="text-center mb-3">Spending Comparison</h5>
              <BarChart
                width={1200}
                height={300}
                data={chartData}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                barCategoryGap="10%"
                barGap={10}
              >
                <XAxis dataKey="name" padding={{ left: 0, right: 0 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="averageSpending"
                  fill="#9BBFE0"
                  name="Average Spending"
                  barSize={40}
                />
                <Bar
                  dataKey="thisMonthSpending"
                  fill="#E8A09A"
                  name="This Month Spending"
                  barSize={40}
                />
              </BarChart>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default Insights;
