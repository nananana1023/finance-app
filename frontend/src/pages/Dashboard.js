import { useContext } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import AuthContext from "../context/AuthContext";

const Dashboard = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate(); // Initialize navigation

  const handleLogout = () => {
    logoutUser(); // Call logout function
    navigate("/"); // Redirect to Home
  };

  return (
    <div>
      {/* Show logged-in user’s username */}
      <h2>Welcome, {user?.username}!</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
