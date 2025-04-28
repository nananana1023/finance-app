import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import api from "../utils/api";

const FinancialProfileForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    last_name: "",
    first_name: "",
    currency: "",
    country: "",
    monthly_income: "",
    monthly_spending_goal: "",
    savings_percent: "",
    age_range: "",
    gender: "",
    future_goals: [],
  });

  const [errorMessage, setErrorMessage] = useState("");

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

  const CURRENCIES = [...new Set(EUROPEAN_COUNTRIES.map((c) => c.currency))];

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (e) => {
    setFormData((prev) => ({ ...prev, country: e.target.value }));
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
    setErrorMessage("");

    try {
      await api.post("financial-profile/", formData);
      onSuccess();
    } catch (error) {
      processErrorMessage(error);
    }
  };

  const processErrorMessage = (error) => {
    const data = error.response?.data;
    if (data?.non_field_errors && Array.isArray(data.non_field_errors)) {
      setErrorMessage(data.non_field_errors.join(" "));
    } else if (data?.detail) {
      setErrorMessage(data.detail);
    } else if (data && typeof data === "object") {
      setErrorMessage(JSON.stringify(data));
    } else {
      setErrorMessage(error.message);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#E9E9DF" }}>
      <Container className="py-5" style={{ maxWidth: "50%", margin: "0 auto" }}>
        <Row className="justify-content-center">
          <Col xs={12}>
            <h5 className="text-center mb-4" style={{ color: "black" }}>
              Welcome to MoneySavvy! Please complete your financial profile.
            </h5>
            <div
              style={{
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
              }}
            >
              <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
                <div className="mb-3" style={{ marginTop: "20px" }}>
                  <label style={{ color: "black" }}>Last name</label>
                  <input
                    type="text"
                    name="last_name"
                    onChange={handleChange}
                    required
                    maxLength="50"
                    className="form-control"
                    style={{
                      backgroundColor: "#E9E9DF",
                      borderColor: "#D9C9B3",
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label style={{ color: "black" }}>First name</label>
                  <input
                    type="text"
                    name="first_name"
                    onChange={handleChange}
                    required
                    maxLength="50"
                    className="form-control"
                    style={{
                      backgroundColor: "#E9E9DF",
                      borderColor: "#D9C9B3",
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label style={{ color: "black" }}>
                    What is your preferred default currency?
                  </label>
                  <select
                    name="currency"
                    onChange={handleChange}
                    required
                    className="form-select"
                    style={{
                      backgroundColor: "#E9E9DF",
                      borderColor: "#D9C9B3",
                    }}
                  >
                    <option value="">Select Currency</option>
                    {CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label style={{ color: "black" }}>
                    Which country do you currently reside in?
                  </label>
                  <select
                    name="country"
                    onChange={handleCountryChange}
                    required
                    className="form-select"
                    style={{
                      backgroundColor: "#E9E9DF",
                      borderColor: "#D9C9B3",
                    }}
                  >
                    <option value="">Select Country</option>
                    {EUROPEAN_COUNTRIES.map(({ name }) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label style={{ color: "black" }}>
                    What is your total monthly income? ({formData.currency})
                  </label>
                  <input
                    type="number"
                    name="monthly_income"
                    onChange={handleChange}
                    required
                    className="form-control"
                    style={{
                      backgroundColor: "#E9E9DF",
                      borderColor: "#D9C9B3",
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label style={{ color: "black" }}>
                    What is your target monthly spending limit? (
                    {formData.currency})
                  </label>
                  <input
                    type="number"
                    name="monthly_spending_goal"
                    onChange={handleChange}
                    required
                    className="form-control"
                    style={{
                      backgroundColor: "#E9E9DF",
                      borderColor: "#D9C9B3",
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label style={{ color: "black" }}>
                    What percentage of your income do you plan to save or
                    invest?
                  </label>
                  <select
                    name="savings_percent"
                    onChange={handleChange}
                    required
                    className="form-select"
                    style={{
                      backgroundColor: "#E9E9DF",
                      borderColor: "#D9C9B3",
                    }}
                  >
                    <option value="">Select Percentage</option>
                    {SAVINGS_PERCENT_CHOICES.map((choice) => (
                      <option key={choice} value={choice}>
                        {choice}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label style={{ color: "black" }}>How old are you?</label>
                  <select
                    name="age_range"
                    onChange={handleChange}
                    required
                    className="form-select"
                    style={{
                      backgroundColor: "#E9E9DF",
                      borderColor: "#D9C9B3",
                    }}
                  >
                    <option value="">Select Age Range</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45+">45+</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label style={{ color: "black" }}>What is your gender?</label>
                  <select
                    name="gender"
                    onChange={handleChange}
                    required
                    className="form-select"
                    style={{
                      backgroundColor: "#E9E9DF",
                      borderColor: "#D9C9B3",
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label style={{ color: "black" }}>
                    What are your future financial goals?
                  </label>
                  <div>
                    {FINANCIAL_GOALS.map((goal) => (
                      <div key={goal} className="form-check">
                        <input
                          type="checkbox"
                          value={goal}
                          onChange={handleCheckboxChange}
                          className="form-check-input"
                          id={goal}
                          style={{
                            accentColor: "#D9C9B3",
                          }}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={goal}
                          style={{ color: "black" }}
                        >
                          {goal}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <button
                    type="submit"
                    className="btn w-100"
                    style={{
                      backgroundColor: "#D9C9B3",
                      color: "black",
                      marginBottom: "20px",
                    }}
                  >
                    Save Profile
                  </button>
                  {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                      {errorMessage}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FinancialProfileForm;
