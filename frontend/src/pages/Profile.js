import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import AuthContext from "../context/AuthContext";

const Profile = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <div>
      <Header />
      <h2>👋 Hello, {user ? user.username : "Guest"}!</h2>{" "}
      {/* ✅ Prevents error */}
      <p>Update your personal and financial information.</p>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Profile;
