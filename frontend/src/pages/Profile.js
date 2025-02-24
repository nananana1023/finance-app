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
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({
    monthly_income: "",
    monthly_spending_goal: "",
  });

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("accessToken");

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
        const headers = { Authorization: `Bearer ${token}` };

        console.log("Fetching user financial profile...");
        const profileResponse = await axios.get(
          "http://127.0.0.1:8000/api/financial-profile/",
          { headers }
        );
        console.log("Profile API Response:", profileResponse.data);

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

    fetchProfileData();
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    setUpdatedProfile({
      ...updatedProfile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Send the update request
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/financial-profile/${user.id}/`,
        updatedProfile,
        { headers }
      );

      setProfile(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div>
      <Header />
      <h2>👋 Hello, {user ? user.username : ""}!</h2>

      {profile ? (
        <div>
          {isEditing ? (
            <div>
              <label>
                Monthly Income:
                <input
                  type="number"
                  name="monthly_income"
                  value={updatedProfile.monthly_income}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Monthly Spending Goal:
                <input
                  type="number"
                  name="monthly_spending_goal"
                  value={updatedProfile.monthly_spending_goal}
                  onChange={handleInputChange}
                />
              </label>

              <button onClick={handleSave}>Save</button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          ) : (
            <div>
              <p>
                <strong>Monthly Income:</strong>{" "}
                {CURRENCY_SYMBOLS[profile.currency] || profile.currency}{" "}
                {profile.monthly_income}
              </p>
              <p>
                <strong>Monthly Spending Goal:</strong>{" "}
                {CURRENCY_SYMBOLS[profile.currency] || profile.currency}{" "}
                {profile.monthly_spending_goal}
              </p>
              {/* <p>
                <strong>Savings/Investment percent:</strong>{" "}
                {profile.savings_percent}
              </p> */}
              <button onClick={handleEditClick}>Edit</button>
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
