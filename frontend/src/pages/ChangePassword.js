import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import { Eye, EyeOff } from "lucide-react";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const [error, setError] = useState("");
  const [successMessage] = useState("");

  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };

  const checkPasswordStrength = (password) => {
    if (!showPasswordValidation) {
      setShowPasswordValidation(true);
    }
    setPassword(password);
    setFormData({ ...formData, new_password: password });
    setPasswordChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        "http://127.0.0.1:8000/auth/change-password/",
        formData,
        { headers }
      );
      setError("");
      navigate("/profile", { state: { successMessage: response.data.detail } });
    } catch (err) {
      setError(
        err.response?.data?.old_password ||
          "An error occurred updating passowrd."
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
        <h2>Change Password</h2>

        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="position-relative mb-3">
            <label>Old Password</label>
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
          <div className="position-relative mb-3">
            <label>New Password</label>
            <input
              type={showNewPassword ? "text" : "password"}
              name="new_password"
              value={password}
              onChange={(e) => checkPasswordStrength(e.target.value)}
              required
              className="form-control"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="btn btn-link position-absolute"
              style={{
                right: "10px",
                top: "calc(50% + 9px)",
                transform: "translateY(-50%)",
                fontSize: "16px",
              }}
            >
              {showNewPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          {showPasswordValidation && (
            <div className="password-validation">
              <p style={{ color: passwordChecks.length ? "green" : "red" }}>
                {passwordChecks.length ? "✓" : "✗"} At least 8 characters
              </p>
              <p style={{ color: passwordChecks.uppercase ? "green" : "red" }}>
                {passwordChecks.uppercase ? "✓" : "✗"} Contains an uppercase
                letter
              </p>
              <p style={{ color: passwordChecks.lowercase ? "green" : "red" }}>
                {passwordChecks.lowercase ? "✓" : "✗"} Contains a lowercase
                letter
              </p>
              <p style={{ color: passwordChecks.number ? "green" : "red" }}>
                {passwordChecks.number ? "✓" : "✗"} Contains a number
              </p>
              <p
                style={{ color: passwordChecks.specialChar ? "green" : "red" }}
              >
                {passwordChecks.specialChar ? "✓" : "✗"} Contains a special
                character
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={!Object.values(passwordChecks).every(Boolean)}
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
          style={{ backgroundColor: "#D9C9B3", color: "black", border: "none" }}
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
