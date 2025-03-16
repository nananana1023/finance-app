import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const ChangePassword = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form data state for old password and new password
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
  });

  // State for real-time password validation
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
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };

  // Function to check password strength on every keystroke
  const checkPasswordStrength = (password) => {
    if (!showPasswordValidation) {
      setShowPasswordValidation(true);
    }
    setPassword(password);
    // Also update new_password in the form data
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
    <div>
      <h2>Change Password</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Old Password</label>
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
          <label>New Password</label>
          <input
            type="password"
            name="new_password"
            value={password}
            onChange={(e) => checkPasswordStrength(e.target.value)}
            required
          />
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
              {passwordChecks.lowercase ? "✓" : "✗"} Contains a lowercase letter
            </p>
            <p style={{ color: passwordChecks.number ? "green" : "red" }}>
              {passwordChecks.number ? "✓" : "✗"} Contains a number
            </p>
            <p style={{ color: passwordChecks.specialChar ? "green" : "red" }}>
              {passwordChecks.specialChar ? "✓" : "✗"} Contains a special
              character
            </p>
          </div>
        )}
        <button type="submit">Submit</button>
      </form>
      <button onClick={() => navigate("/profile")}>Back to Profile</button>
    </div>
  );
};

export default ChangePassword;
