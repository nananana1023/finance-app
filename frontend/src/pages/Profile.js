import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import AuthContext from "../context/AuthContext";
import { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import api from "../utils/api";

const Profile = () => {
  const { CURRENCY_SYMBOLS, user, logoutUser, loading } =
    useContext(AuthContext);
  const navigate = useNavigate();
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

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setError("User is not authenticated.");
      return;
    }

    const fetchProfileData = async () => {
      try {
        const profileResponse = await api.get("financial-profile/");
        setProfile(profileResponse.data[0]);
        console.log("Profile data:", profileResponse.data[0]);
      } catch (error) {
        setError("Failed to load user data.");
      }
    };

    fetchProfileData();
  }, [loading, user, token]);

  useEffect(() => {
    if (location.state && location.state.successMessage) {
      setSuccessMessage(location.state.successMessage);
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state && location.state.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
      const response = await api.patch(
        `financial-profile/${user.id}/`,
        updatedProfile
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
        const errorData = error.response?.data;
        const allMessages = [];
        for (const key in errorData) {
          if (Array.isArray(errorData[key])) {
            allMessages.push(...errorData[key]);
          }
        }
        setFormError(allMessages);
      } else {
        console.error("Error updating profile.", error);
        setFormError(["Something went wrong."]);
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        fontFamily: "Monospace",
      }}
    >
      <Header />

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <h3 className="text-center mb-4" style={{ color: "black" }}>
              Hello, {profile ? profile.first_name : ""}!
            </h3>

            {successMessage && (
              <div className="alert alert-success" role="alert">
                {successMessage}
              </div>
            )}

            {formError && <div className="alert alert-danger">{formError}</div>}
            <Card
              className="mb-4"
              style={{
                border: "none",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <Card.Body style={{ backgroundColor: "#E9E9DF" }}>
                <div className="d-flex justify-content-center mb-3">
                  <button
                    onClick={() => setActiveMenu("user")}
                    style={{
                      fontWeight: activeMenu === "user" ? "bold" : "normal",
                      backgroundColor:
                        activeMenu === "user" ? "#D9C9B3" : "#E9E9DF",
                      color: "black",
                      border: "1px solid #D9C9B3",
                      borderRadius: "4px",
                      padding: "8px 16px",
                      marginRight: "10px",
                      cursor: "pointer",
                    }}
                  >
                    User Profile
                  </button>
                  <button
                    onClick={() => setActiveMenu("financial")}
                    style={{
                      fontWeight:
                        activeMenu === "financial" ? "bold" : "normal",
                      backgroundColor:
                        activeMenu === "financial" ? "#D9C9B3" : "#E9E9DF",
                      color: "black",
                      border: "1px solid #D9C9B3",
                      borderRadius: "4px",
                      padding: "8px 16px",
                      cursor: "pointer",
                    }}
                  >
                    Financial Profile
                  </button>
                </div>
                {activeMenu === "user" && (
                  <div>
                    <p>
                      <strong>Username:</strong> {user ? user.username : "N/A"}
                    </p>
                    <p>
                      <strong>Country:</strong>{" "}
                      {profile ? profile.country : "N/A"}
                    </p>
                    <p>
                      <strong>Default Currency:</strong> {profile?.currency}
                    </p>
                    <div className="d-flex gap-2">
                      <Button
                        style={{
                          backgroundColor: "#D9C9B3",
                          color: "black",
                          border: "none",
                        }}
                        className="btn-animate"
                        onClick={() => navigate("/change-password")}
                      >
                        Change Password
                      </Button>
                      <Button
                        style={{
                          backgroundColor: "#D9C9B3",
                          color: "black",
                          border: "none",
                        }}
                        className="btn-animate"
                        onClick={() => navigate("/change-username")}
                      >
                        Change Username
                      </Button>
                    </div>
                  </div>
                )}
                {activeMenu === "financial" && (
                  <div>
                    {isEditing ? (
                      <div>
                        <Form.Group className="mb-3">
                          <Form.Label>Monthly Income:</Form.Label>
                          <div className="d-flex align-items-center">
                            <Form.Control
                              type="number"
                              name="monthly_income"
                              value={updatedProfile.monthly_income}
                              onChange={handleInputChange}
                            />
                            <span className="ms-2">
                              {CURRENCY_SYMBOLS[profile.currency] ||
                                profile.currency}
                            </span>
                          </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Monthly Spending Goal:</Form.Label>
                          <div className="d-flex align-items-center">
                            <Form.Control
                              type="number"
                              name="monthly_spending_goal"
                              value={updatedProfile.monthly_spending_goal}
                              onChange={handleInputChange}
                            />
                            <span className="ms-2">
                              {CURRENCY_SYMBOLS[profile.currency] ||
                                profile.currency}
                            </span>
                          </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Savings Percentage:</Form.Label>
                          <Form.Select
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
                          </Form.Select>
                        </Form.Group>
                        <div className="d-flex gap-2">
                          <Button
                            style={{
                              backgroundColor: "#D9C9B3",
                              color: "black",
                              border: "none",
                            }}
                            className="btn-animate"
                            onClick={handleSave}
                          >
                            Save
                          </Button>
                          <Button
                            style={{
                              backgroundColor: "#D9C9B3",
                              color: "black",
                              border: "none",
                            }}
                            className="btn-animate"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p>
                          <strong>Monthly Income:</strong>{" "}
                          {profile.monthly_income}
                          {CURRENCY_SYMBOLS[profile.currency] ||
                            profile.currency}
                        </p>
                        <p>
                          <strong>Monthly Spending Goal:</strong>{" "}
                          {profile.monthly_spending_goal}
                          {CURRENCY_SYMBOLS[profile.currency] ||
                            profile.currency}
                        </p>
                        <p>
                          <strong>Savings Percentage:</strong>{" "}
                          {profile.savings_percent}
                        </p>
                        <Button
                          style={{
                            backgroundColor: "#D9C9B3",
                            color: "black",
                            border: "none",
                          }}
                          className="btn-animate"
                          onClick={handleEdit}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
            <div className="text-center">
              <Button variant="outline-danger" onClick={handleLogout}>
                Log Out
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
      <style>{`
        .btn-animate:hover {
          transform: scale(1.05);
          transition: transform 0.2s;
        }
      `}</style>
    </div>
  );
};

export default Profile;
