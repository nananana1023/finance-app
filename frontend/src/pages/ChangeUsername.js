import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { Eye, EyeOff } from "lucide-react";

const ChangeUsername = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    old_password: "",
    new_username: "",
  });
  const [showPassword, setShowPassword] = useState(false);
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
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        fontFamily: "Monospace",
      }}
    >
      <Header />
      <div style={{ width: "50%", margin: "0 auto", padding: "20px" }}>
        <h2>Change Username</h2>
        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="position-relative mb-3">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="old_password"
              value={formData.old_password}
              onChange={(e) =>
                setFormData({ ...formData, old_password: e.target.value })
              }
              required
              className="form-control"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="btn btn-link position-absolute"
              style={{
                right: "10px",
                top: "calc(50% + 9px)",
                transform: "translateY(-50%)",
                fontSize: "16px",
              }}
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          <div className="mb-3">
            <label>New Username</label>
            <input
              type="text"
              name="new_username"
              value={formData.new_username}
              onChange={(e) =>
                setFormData({ ...formData, new_username: e.target.value })
              }
              required
              className="form-control"
            />
          </div>
          <button
            type="submit"
            className="btn btn-animate mt-3"
            style={{
              backgroundColor: "#A5BB9F",
              color: "black",
              border: "none",
            }}
          >
            Submit
          </button>
        </form>
        <button
          onClick={() => navigate("/profile")}
          className="btn btn-animate mt-3"
          style={{
            backgroundColor: "#D9C9B3",
            color: "black",
            border: "none",
          }}
        >
          Back to Profile
        </button>
      </div>
      <style>{`
        .btn-animate:hover {
          transform: scale(1.05);
          transition: transform 0.2s;
        }
      `}</style>
    </div>
  );
};

export default ChangeUsername;
