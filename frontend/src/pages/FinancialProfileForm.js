import { useState } from "react";
import axios from "axios";
import "../index.css";
import { refreshAccessToken } from "../utils/auth";

const FinancialProfileForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    currency: "",
    country: "",
    monthly_income: "",
    monthly_spending_goal: "",
    savings_percent: "",
    age_range: "",
    gender: "",
    future_goals: [],
  });

  const EUROPEAN_COUNTRIES = [
    { name: "Austria", currency: "EUR" },
    { name: "Belgium", currency: "EUR" },
    { name: "Bulgaria", currency: "BGN" },
    { name: "Croatia", currency: "EUR" },
    { name: "Czech Republic", currency: "CZK" },
    { name: "Denmark", currency: "DKK" },
    { name: "Hungary", currency: "HUF" },
    { name: "Iceland", currency: "ISK" },
    { name: "Norway", currency: "NOK" },
    { name: "Poland", currency: "PLN" },
    { name: "Romania", currency: "RON" },
    { name: "Sweden", currency: "SEK" },
    { name: "United Kingdom", currency: "GBP" },
  ];

  const CURRENCIES = [...new Set(EUROPEAN_COUNTRIES.map((c) => c.currency))]; // Unique currencies

  const FINANCIAL_GOALS = [
    "Pay off debts",
    "Build an emergency fund",
    "Invest for the future",
    "General budgeting",
    "Business investment",
  ];

  const SAVINGS_PERCENT_CHOICES = ["10%", "20%", "30%", "50%+"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCountryChange = (e) => {
    setFormData({ ...formData, country: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      future_goals: checked
        ? [...prev.future_goals, value]
        : prev.future_goals.filter((goal) => goal !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let token = localStorage.getItem("accessToken");

    if (!token) {
      console.error("No authentication token found.");
      alert("Session expired. Please log in again.");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/financial-profile/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      onSuccess();
    } catch (error) {
      console.error(
        "Error submitting financial profile:",
        error.response?.data || error.message
      );

      if (error.response?.status === 401) {
        console.log("Token expired. Refreshing...");

        token = await refreshAccessToken();
        if (token) {
          try {
            await axios.post(
              "http://127.0.0.1:8000/api/financial-profile/",
              formData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            onSuccess();
          } catch (retryError) {
            console.error(
              "Retry failed:",
              retryError.response?.data || retryError.message
            );
          }
        } else {
          alert("Session expired. Please log in again.");
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h3>Complete Your Financial Profile</h3>

      <label>What is your preferred default currency?</label>
      <select name="currency" onChange={handleChange} required>
        <option value="">Select Currency</option>
        {CURRENCIES.map((curr) => (
          <option key={curr} value={curr}>
            {curr}
          </option>
        ))}
      </select>

      <label>Which country do you currently reside in?</label>
      <select name="country" onChange={handleCountryChange} required>
        <option value="">Select Country</option>
        {EUROPEAN_COUNTRIES.map(({ name }) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <label>What is your total monthly income? ({formData.currency})</label>
      <input
        type="number"
        name="monthly_income"
        onChange={handleChange}
        required
      />

      <label>
        What is your target monthly spending limit? ({formData.currency})
      </label>
      <input
        type="number"
        name="monthly_spending_goal"
        onChange={handleChange}
        required
      />

      <label>
        What percentage of your income do you plan to save or invest?
      </label>
      <select name="savings_percent" onChange={handleChange} required>
        <option value="">Select Percentage</option>
        {SAVINGS_PERCENT_CHOICES.map((choice) => (
          <option key={choice} value={choice}>
            {choice}
          </option>
        ))}
      </select>

      <label>How old are you?</label>
      <select name="age_range" onChange={handleChange} required>
        <option value="">Select Age Range</option>
        <option value="18-24">18-24</option>
        <option value="25-34">25-34</option>
        <option value="35-44">35-44</option>
        <option value="45+">45+</option>
      </select>

      <label>What is your gender?</label>
      <select name="gender" onChange={handleChange} required>
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Non-binary">Non-binary</option>
        <option value="Prefer not to say">Prefer not to say</option>
      </select>

      <label>What are your future financial goals?</label>
      <div>
        {FINANCIAL_GOALS.map((goal) => (
          <div key={goal}>
            <input
              type="checkbox"
              value={goal}
              onChange={handleCheckboxChange}
            />{" "}
            {goal}
          </div>
        ))}
      </div>

      <button type="submit">Save Profile</button>
    </form>
  );
};

export default FinancialProfileForm;
