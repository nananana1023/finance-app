import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FinancialProfileForm from "./FinancialProfileForm";

const Dashboard = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/financial-profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.length > 0) {
          setProfile(response.data[0]);
          navigate("/userhome");
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error(
          "Error fetching profile:",
          error.response?.data || error.message
        );
        setError(error.response?.data?.detail || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleProfileSubmit = () => {
    setProfile(true);
    navigate("/profile", {
      state: {
        message: "Your financial profile has been set up successfully! ",
      },
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}> {error}</p>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#E9E9DF" }}>
      {profile ? (
        <p>Your financial profile is set up. Start exploring! </p>
      ) : (
        <FinancialProfileForm onSuccess={handleProfileSubmit} />
      )}
    </div>
  );
};

export default Dashboard;
