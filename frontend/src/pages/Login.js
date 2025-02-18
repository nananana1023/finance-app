import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios for API calls
import AuthContext from "../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState(""); // State for username validation error
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate(); // useNavigate inside component
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [error, setError] = useState(""); // State for login errors

  /**
   * Function to check if username exists in real-time
   */
  const validateUsername = async (username) => {
    setUsername(username);

    // If username is empty, clear the error
    if (!username) {
      setUsernameError("");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/login-validate-username/",
        { username }
      );

      if (response.data.valid === false) {
        setUsernameError(response.data.message); // Show Django error
      } else {
        setUsernameError(""); // Clear error if username exists
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setUsernameError(error.response.data.message); // Show Django error
      } else {
        setUsernameError("An error occurred while validating the username.");
      }
    }
  };

  /**
   * Function to handle login submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if username doesn't exist
    if (usernameError) return;

    try {
      await loginUser(username, password, navigate);
    } catch (error) {
      console.error("Login failed:", error.message);
      setError("Incorrect password."); // Set error message
    }
  };

  return (
    <div>
      <h2>Log in</h2>
      <form onSubmit={handleSubmit}>
        {/* Username Input */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => validateUsername(e.target.value)}
          required
        />
        {usernameError && (
          <p style={{ color: "red", fontSize: "0.9rem" }}>{usernameError}</p>
        )}

        {/* Password Input with Eye Toggle */}
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"} // Toggle input type
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", paddingRight: "40px" }} // Ensure space for the button
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

        {/* Show login error */}
        {error && <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}

        {/* Log In Button - Disabled if fields are empty or username has error */}
        <button
          type="submit"
          disabled={!username || !password || !!usernameError}
        >
          Log In
        </button>

        {/* Create Account Link */}
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
      </form>
    </div>
  );
};

export default Login;
