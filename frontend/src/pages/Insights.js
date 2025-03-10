import { useEffect, useState, useContext, Fragment } from "react";
import React from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Header from "../components/Header";
import MonthContext from "../context/MonthContext";
import "../index.css";

const Insights = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };
  const [summary, setSummary] = useState({
    total_expense: 0,
    total_income: 0,
    total_investment: 0,
  });
  const [total_expenses, setTotalExpenses] = useState(null);
  const [avg, setAvg] = useState(null);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    //sum of  expense, income, inv of this month
    const fetchSummary = async () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

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

    //total expenses over months until now
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
        // console.log(profile.savings_percent);
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
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/sum-subcategories-month/${year}/${month}/`,
          { headers }
        );
        console.log("Sum per category: ", response.data);
        setPieData(response.data);
      } catch (error) {
        console.error("Error fetching sum per category:", error);
      }
    };

    fetchProfile();
    fetchSummary();
    fetchTotalExpenses();
    fetchAvgAmounts();
    fetchPieData();
  }, [user]);

  const invest_goal_amount = profile
    ? (parseInt(profile.savings_percent.slice(0, 2), 10) / 100) *
      summary.total_income
    : null;

  return (
    <div>
      <Header />
      <h2>Financial Insights</h2>

      {/* expense exceeds spending goal  */}
      {profile && summary.total_expense > profile.monthly_spending_goal && (
        <p>You spent more than the goal this month. </p>
      )}

      {/* when savings portion is below the desired percentage */}
      {profile && summary.total_investment < invest_goal_amount && (
        <p>You invested less than the goal this month.</p>
      )}

      {/* spending more than average on a category  */}
      <div>
        {pieData &&
          pieData.map((item, index) => {
            // Find the corresponding average object for this subcategory.
            const avgItem =
              avg && avg.find((a) => a.subcategory === item.subcategory);

            // Only show this message for expense items and when the total_amount is above the average.
            if (
              item.category === "expense" &&
              avgItem &&
              item.total_amount > avgItem.average
            ) {
              return (
                <p key={index}>
                  This month's spending for <strong>{item.subcategory}</strong>{" "}
                  is <strong>{item.total_amount}</strong>, which is more than
                  your average spending of <strong>{avgItem.average}</strong>.
                </p>
              );
            }
            return null;
          })}
      </div>
    </div>
  );
};

export default Insights;
