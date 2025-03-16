import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const ChangeUsername = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    old_password: "",
    new_username: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("accessToken");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        "http://127.0.0.1:8000/auth/change-username/",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setError("");
      setSuccessMessage(response.data.detail);
      navigate("/profile", { state: { successMessage: response.data.detail } });
    } catch (err) {
      setError(
        err.response?.data?.detail || "An error occurred updating username."
      );
    }
  };

  return (
    <div>
      <h2>Change Username</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Password</label>
          <input
            type="password"
            name="old_password"
            value={formData.old_password}
            onChange={(e) =>
              setFormData({ ...formData, old_password: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label>New Username</label>
          <input
            type="text"
            name="new_username"
            value={formData.new_username}
            onChange={(e) =>
              setFormData({ ...formData, new_username: e.target.value })
            }
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      <button onClick={() => navigate("/profile")}>Back to Profile</button>
    </div>
  );
};

export default ChangeUsername;
