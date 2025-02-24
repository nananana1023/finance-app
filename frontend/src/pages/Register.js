import { useState } from "react";
import axios from "axios"; // Axios - for making HTTP requests
import { useNavigate } from "react-router-dom"; // React Router navigation
import { Eye, EyeOff } from "lucide-react"; // Import eye icons

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Controls password visibility

  // State for tracking password rules
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const [error, setError] = useState(""); // General registration error
  const [emailError, setEmailError] = useState("");
  const [showPasswordValidation, setShowPasswordValidation] = useState(false); // Show password rules only when user types
  const [usernameError, setUsernameError] = useState("");
  const [step, setStep] = useState(1); // Step 1: Register, Step 2: Verify Code
  const [verificationCode, setVerificationCode] = useState("");
  const navigate = useNavigate(); // React Router's navigation function

  const validateUsername = async (username) => {
    setUsername(username);

    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters.");
      return;
    } else {
      setUsernameError("");
    }

    try {
      console.log("Sending request:", { username });

      const response = await axios.post(
        "http://127.0.0.1:8000/auth/validate-username/",
        { username },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);

      if (!response.data.valid) {
        setUsernameError(response.data.message);
      } else {
        setUsernameError("");
      }
    } catch (error) {
      console.error(
        "API Error:",
        error.response ? error.response.data : error.message
      );

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setUsernameError(error.response.data.message);
      } else {
        setUsernameError("An error occurred while validating the username.");
      }
    }
  };

  const checkPasswordStrength = (password) => {
    if (!showPasswordValidation) {
      setShowPasswordValidation(true); // Show password rules only after the user types
    }

    setPassword(password); // Update password state

    setPasswordChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const validateEmail = async (email) => {
    setEmail(email);

    // Standard email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setEmailError("Enter a valid email address.");
      return;
    } else {
      setEmailError(""); // Clear format error
    }

    // Send request to Django to validate the email
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/validate-email/",
        { email }
      );

      if (response.data.valid === false) {
        setEmailError(response.data.message); // Set Django's exact message
      } else {
        setEmailError(""); // Clear error if email is valid
      }
    } catch (error) {
      console.error("Email validation error:", error.response?.data);

      // Extract Django's error message correctly
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setEmailError(error.response.data.message); // Show Django's exact message
      } else {
        setEmailError("An error occurred while validating the email.");
        console.error("Full email error response:", error.response);
      }
    }
  };

  /**
   * Step 1: Request Verification Code
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://127.0.0.1:8000/auth/request-verification-code/",
        {
          email,
        }
      );
      setStep(2); // Move to verification step
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to send verification code."
      );
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://127.0.0.1:8000/auth/verify-code/", {
        email,
        code: verificationCode,
        username,
        password,
      });
      navigate("/login", {
        state: {
          successMessage: "Account successfully verified! You can now log in.",
        },
      });
    } catch (error) {
      setError(error.response?.data?.message || "Invalid verification code.");
    }
  };

  return (
    <div>
      <h2>{step === 1 ? "Register" : "Verify Email"}</h2>

      {step === 1 ? (
        // {/* general error message */}
        // {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleRegister}>
          {/* Username input field */}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => validateUsername(e.target.value)}
            required
          />
          {/* Show username validation error in real-time */}
          {usernameError && (
            <p style={{ color: "red", fontSize: "0.9rem" }}>{usernameError}</p>
          )}

          {/* Email input field */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => validateEmail(e.target.value)}
            required
          />
          {/* Show Django's validation errors in real-time */}
          {emailError && (
            <p style={{ color: "red", fontSize: "0.9rem" }}>{emailError}</p>
          )}

          {/* Password input field with Show/Hide Toggle */}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"} // Toggle input type
              placeholder="Password"
              value={password}
              onChange={(e) => checkPasswordStrength(e.target.value)} // Validate password as user types
              required
              style={{ width: "100%", paddingRight: "40px" }} // Ensure enough space for the button
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

          {/* Real-time Password Validation Messages (Only Show After User Starts Typing) */}
          {showPasswordValidation && (
            <ul style={{ listStyleType: "none", padding: 0 }}>
              <li style={{ color: passwordChecks.length ? "green" : "red" }}>
                {passwordChecks.length ? "✅" : "❌"} At least 8 characters
              </li>
              <li style={{ color: passwordChecks.uppercase ? "green" : "red" }}>
                {passwordChecks.uppercase ? "✅" : "❌"} At least one uppercase
                letter
              </li>
              <li style={{ color: passwordChecks.lowercase ? "green" : "red" }}>
                {passwordChecks.lowercase ? "✅" : "❌"} At least one lowercase
                letter
              </li>
              <li style={{ color: passwordChecks.number ? "green" : "red" }}>
                {passwordChecks.number ? "✅" : "❌"} At least one number
              </li>
              <li
                style={{ color: passwordChecks.specialChar ? "green" : "red" }}
              >
                {passwordChecks.specialChar ? "✅" : "❌"} At least one special
                character
              </li>
            </ul>
          )}
          {/* Disable Submit Button When Validation Fails */}
          <button
            type="submit"
            disabled={
              !!usernameError ||
              !!emailError ||
              !Object.values(passwordChecks).every(Boolean)
            }
          >
            Sign Up
          </button>

          <p style={{ marginTop: "10px", fontSize: "0.9rem" }}>
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "none",
                border: "none",
                color: "blue",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "0.9rem",
              }}
            >
              Log in
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <p>A verification code was sent to {email}. Enter the code below:</p>
          <input
            type="text"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
          <button type="submit">Verify Code</button>
        </form>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Register;
