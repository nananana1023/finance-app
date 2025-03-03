import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import AuthContext from "../context/AuthContext";
import { useEffect, useState, useContext } from "react";
import axios from "axios";

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

const Profile = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({
    monthly_income: "",
    monthly_spending_goal: "",
  });

  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  useEffect(() => {
    const fetchProfileData = async () => {
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
        setProfile(profileResponse.data[0]);
        console.log("Profile data:", profile);
      } catch (error) {
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleEdit = () => {
    setUpdatedProfile({
      monthly_income: profile.monthly_income,
      monthly_spending_goal: profile.monthly_spending_goal,
      savings_percent: profile.savings_percent,
      currency: profile.currency,
    });
    setFormError("");
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    setUpdatedProfile({
      ...updatedProfile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (
      !updatedProfile.monthly_income ||
      !updatedProfile.monthly_spending_goal ||
      !updatedProfile.savings_percent
    ) {
      setFormError("All fields are required.");
      return;
    }

    try {
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/financial-profile/${user.id}/`,
        updatedProfile,
        { headers }
      );

      setProfile(response.data);
      setIsEditing(false);

      setSuccessMessage("Your financial profile is updated successfully!");

      setTimeout(() => {
        setSuccessMessage(""); // Hide message after 5 seconds
      }, 5000);
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data || error.message
      );
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}> {error}</p>;

  return (
    <div>
      <Header />
      <h2>👋 Hello, {user ? user.username : ""}!</h2>

      {successMessage && (
        <p
          style={{
            color: "green",
            background: "#d4edda",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          {successMessage}
        </p>
      )}

      {profile ? (
        <div>
          {isEditing ? (
            <div>
              {formError && <p style={{ color: "red" }}>{formError}</p>}

              <label>
                Monthly Income:
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="number"
                    name="monthly_income"
                    value={updatedProfile.monthly_income}
                    onChange={handleInputChange}
                  />
                  <span style={{ marginLeft: "5px" }}>
                    {CURRENCY_SYMBOLS[profile.currency] || profile.currency}
                  </span>
                </div>
              </label>

              <label>
                Monthly Spending Goal:
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="number"
                    name="monthly_spending_goal"
                    value={updatedProfile.monthly_spending_goal}
                    onChange={handleInputChange}
                  />
                  <span style={{ marginLeft: "5px" }}>
                    {CURRENCY_SYMBOLS[profile.currency] || profile.currency}
                  </span>
                </div>
              </label>

              <label>
                Savings percentage:
                <select
                  name="savings_percent"
                  value={updatedProfile.savings_percent}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Percentage</option>
                  {["10%", "20%", "30%", "50%+"].map((choice) => (
                    <option key={choice} value={choice}>
                      {choice}
                    </option>
                  ))}
                </select>
              </label>

              <button onClick={handleSave}>Save</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          ) : (
            <div>
              <p>
                <strong>Monthly Income:</strong> {profile.monthly_income}
                {CURRENCY_SYMBOLS[profile.currency] || profile.currency}
              </p>
              <p>
                <strong>Monthly Spending Goal:</strong>{" "}
                {profile.monthly_spending_goal}
                {CURRENCY_SYMBOLS[profile.currency] || profile.currency}
              </p>
              <p>
                <strong>Savings percentage:</strong> {profile.savings_percent}
              </p>
              <button onClick={handleEdit}>Edit</button>
            </div>
          )}
        </div>
      ) : (
        <p>Loading profile...</p>
      )}

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Profile;
