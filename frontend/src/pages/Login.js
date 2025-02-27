import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { useLocation } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate(); // useNavigate inside component
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const successMessage = location.state?.successMessage;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://127.0.0.1:8000/auth/login/", {
        username,
        password,
      });

      console.log("Login successful:", response.data);

      // Store tokens in local storage or state
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setError(error.response?.data?.error || "Invalid Credentials.");
    }
  };

  return (
    <div>
      <h2>Log in</h2>
      {successMessage && (
        <p style={{ color: "green", fontWeight: "bold" }}>{successMessage}</p>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"} // Toggle input type
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", paddingRight: "40px" }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {error && <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}

        <button type="submit" disabled={!username || !password}>
          Log In
        </button>

        <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>
          <button
            onClick={() => navigate("/register")}
            style={{
              background: "none",
              border: "none",
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "0.9rem",
            }}
          >
            Create a new account
          </button>
        </p>

        {/* <p>
          <button
            onClick={() => navigate("/forgot-password")}
            style={{
              background: "none",
              border: "none",
              color: "blue",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "0.9rem",
            }}
          >
            Forgot your password?
          </button>
        </p> */}
      </form>
    </div>
  );
};

export default Login;
