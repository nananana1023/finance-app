import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import AuthContext from "../context/AuthContext";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const Profile = () => {
  const { CURRENCY_SYMBOLS, user, logoutUser } = useContext(AuthContext);
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
  const [activeMenu, setActiveMenu] = useState(null);
  const location = useLocation();

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
        console.log("Profile data:", profileResponse.data[0]);
      } catch (error) {
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  useEffect(() => {
    if (location.state && location.state.successMessage) {
      setSuccessMessage(location.state.successMessage);
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

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
        {
          headers: {
            ...headers,
            Accept: "application/json",
          },
        }
      );
      setProfile(response.data);
      setIsEditing(false);
      setSuccessMessage("Your financial profile is updated successfully!");
      setFormError("");
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      if (error.response && error.response.data) {
        console.log("Errors:", error.response.data);
        const errorMsg =
          error.response.data.non_field_errors &&
          Array.isArray(error.response.data.non_field_errors)
            ? error.response.data.non_field_errors.join(", ")
            : "An error occurred.";
        setFormError(errorMsg);
      } else {
        console.error("Error updating profile.", error);
        setFormError("An error occurred. Please try again.");
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <Header />
      <h2>👋 Hello, {profile ? profile.first_name : ""}!</h2>

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

      {/* Menu Section */}
      <div className="profile-menu" style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setActiveMenu("user")}
          style={{
            fontWeight: activeMenu === "user" ? "bold" : "normal",
            marginRight: "10px",
          }}
        >
          User Profile
        </button>
        <button
          onClick={() => setActiveMenu("financial")}
          style={{ fontWeight: activeMenu === "financial" ? "bold" : "normal" }}
        >
          Financial Profile
        </button>
      </div>
      {activeMenu === "user" && (
        <div className="user-profile">
          <h3>User Profile Details</h3>
          <p>
            <strong>Username:</strong> {user ? user.username : "N/A"}
          </p>
          <p>
            <strong>Country:</strong> {profile ? profile.country : "N/A"}
          </p>
          <p>
            <strong>Default Currency:</strong> {profile?.currency}
          </p>
          <button onClick={() => navigate("/change-password")}>
            Change Password
          </button>
          <button onClick={() => navigate("/change-username")}>
            Edit Username
          </button>
        </div>
      )}

      {activeMenu === "financial" && (
        <div className="financial-profile">
          <h3>Financial Profile Details</h3>
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
      )}

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Profile;
