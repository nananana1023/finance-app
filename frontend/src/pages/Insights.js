import { useEffect, useState, useContext, Fragment } from "react";
import React from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Header from "../components/Header";
import "../index.css";
import FetchContext from "../context/FetchContext";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";

const Insights = () => {
  const { user, CURRENCY_SYMBOLS } = useContext(AuthContext);
  const {
    fetchSummary,
    fetchProfile,
    fetchPieData,
    summary,
    profile,
    pieData,
  } = useContext(FetchContext);
  const { authMessage } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };
  const [avg, setAvg] = useState(null);

  useEffect(() => {
    //avg of expense subcategories
    const fetchAvgAmounts = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/avg-subcategories`,
          { headers }
        );
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
  }, [user]);

  const invest_goal_amount = profile
    ? (parseInt(profile.savings_percent.slice(0, 2), 10) / 100) *
      summary.total_income
    : null;

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

        <Card
          className="mb-4"
          style={{ border: "none", borderRadius: "8px", overflow: "hidden" }}
        >
          <Card.Body style={{ backgroundColor: "#E9E9DF", color: "black" }}>
            {profile &&
              summary.total_expense > profile.monthly_spending_goal && (
                <p>
                  You exceeded your monthly spending goal by{" "}
                  {summary.total_expense - profile.monthly_spending_goal}
                  {CURRENCY_SYMBOLS[profile.currency]}.
                </p>
              )}
            {profile && summary.total_investment < invest_goal_amount && (
              <p>
                You invested {summary.total_investment}
                {CURRENCY_SYMBOLS[profile.currency]} this month which is less
                than your goal.
              </p>
            )}
            <div>
              {pieData &&
                pieData.map((item, index) => {
                  const avgItem =
                    avg && avg.find((a) => a.subcategory === item.subcategory);
                  if (
                    item.category === "expense" &&
                    avgItem &&
                    item.total_amount > avgItem.average
                  ) {
                    return (
                      <p key={index}>
                        This month's spending for{" "}
                        <strong>{item.subcategory}</strong> is{" "}
                        <strong>
                          {item.total_amount}
                          {CURRENCY_SYMBOLS[profile.currency]}
                        </strong>
                        , which is more than your average spending of{" "}
                        <strong>
                          {avgItem.average}
                          {CURRENCY_SYMBOLS[profile.currency]}
                        </strong>
                        .
                      </p>
                    );
                  }
                  return null;
                })}
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Insights;
