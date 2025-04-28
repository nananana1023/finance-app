import { useEffect, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
  Cell,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import Header from "../components/Header";
import MonthContext from "../context/MonthContext";
import PieChartContainer from "./PieChart";
import FetchContext from "../context/FetchContext";
import { Row, Col, Form, Button, InputGroup } from "react-bootstrap";

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

  const location = useLocation();
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
    { category: "Expense", amount: summary.total_expense, color: "#E8A09A" },
    { category: "Income", amount: summary.total_income, color: "#C6D68F" },
    { category: "Savings", amount: summary.total_investment, color: "#9BBFE0" },
  ];

  const CustomXAxisTick = ({ x, y, payload, data }) => {
    const { index, value } = payload;
    const currentDataItem = data[index];

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#666">
          {value}
        </text>

        {value === "January" && (
          <text x={0} y={0} dy={32} textAnchor="middle" fill="#666">
            {currentDataItem?.year}
          </text>
        )}
      </g>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        fontFamily: "monospace",
      }}
    >
      <Header />

      {/* message */}
      {location.state?.message && (
        <Row className="mb-4">
          <Col>
            <div className="alert alert-success" role="alert">
              {location.state?.message || null}
            </div>
          </Col>
        </Row>
      )}

      {/* total line chart */}
      <Row className="my-4">
        <Col md={{ span: 8, offset: 2 }}>
          <h3 className="text-center">
            <strong>Total Spent</strong>
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={total_expenses}
              margin={{ top: 40, right: 30, left: 80, bottom: 50 }}
            >
              <XAxis
                dataKey="month_name"
                padding={{ left: 50, right: 50 }}
                tick={<CustomXAxisTick data={total_expenses} fill="#6CA0DC" />}
                stroke="grey"
              />
              <YAxis hide />
              <ReferenceLine
                y={profile?.monthly_spending_goal}
                stroke="#E8A09A"
                label={({ viewBox }) => {
                  const { x, y } = viewBox;
                  return (
                    <text x={x} y={y - 10} textAnchor="middle" fill="#E8A09A">
                      Goal: {profile?.monthly_spending_goal}
                      {CURRENCY_SYMBOLS[profile?.currency] || profile?.currency}
                    </text>
                  );
                }}
              />
              <Line
                type="linear"
                dataKey="amount"
                stroke="#9BBFE0"
                activeDot={{ r: 8 }}
              >
                <LabelList
                  dataKey="amount"
                  position="top"
                  formatter={(value) =>
                    `${Math.round(value)}${
                      CURRENCY_SYMBOLS[profile?.currency] || profile?.currency
                    }`
                  }
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </Col>
      </Row>

      {/* month selector */}
      <Row className="my-4 justify-content-center">
        <Col xs="auto">
          <InputGroup style={{ maxWidth: "300px" }}>
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
        </Col>
      </Row>

      <Row>
        <Col>
          <div style={{ marginTop: "20px" }}></div>
        </Col>
      </Row>

      <Row className="my-4 mx-5">
        {/* cashflow bar chart */}
        <Col md={6}>
          <h3 className="text-center">
            <strong>Cash Flow</strong>
          </h3>
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
            <p className="text-center">
              No transactions recorded for this month.
            </p>
          )}
        </Col>

        {/* pie chart */}
        <Col md={6}>
          <h3 className="text-center">
            <strong>Transactions by Categories</strong>
          </h3>
          <div className="d-flex justify-content-center">
            <PieChartContainer data={pieData} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default UserHome;
