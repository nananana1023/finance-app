import { Container, Row, Col } from "react-bootstrap";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [step, setStep] = useState(1); // register then verify Code
  const [verificationCode, setVerificationCode] = useState("");
  const navigate = useNavigate();

  const validateUsername = async (username) => {
    setUsername(username);

    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters.");
      return;
    } else {
      setUsernameError("");
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/validate-username/",
        { username },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("username API Response:", response.data);

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
      setShowPasswordValidation(true);
    }

    setPassword(password);

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

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setEmailError("Enter a valid email address.");
      return;
    } else {
      setEmailError("");
    }

    // request to validate email
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/validate-email/",
        { email }
      );

      if (response.data.valid === false) {
        setEmailError(response.data.message); // django message
      } else {
        setEmailError("");
      }
    } catch (error) {
      console.error("Email validation error:", error.response?.data);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setEmailError(error.response.data.message);
      } else {
        setEmailError("An error occurred while validating the email.");
        console.error("Full email error response:", error.response);
      }
    }
  };

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
    <Container fluid className="vh-100" style={{ backgroundColor: "#E9E9DF" }}>
      <Row className="h-100">
        <Col
          md={6}
          className="d-flex flex-column justify-content-center align-items-center text-center"
          style={{ backgroundColor: "#A5BB9F", animation: "fadeIn 1s" }}
        >
          <h1 style={{ fontWeight: 700 }}>MoneySavvy</h1>
          <p>
            <strong>MoneySavvy</strong> (adj.): Being aware and skilled at
            managing money—knowing how to budget, save, and spend wisely.
          </p>
        </Col>
        <Col
          md={6}
          className="d-flex flex-column justify-content-center align-items-center"
        >
          <div className="w-75">
            {step === 1 ? (
              <>
                <h2 className="mb-4 text-center">Sign Up</h2>
                <form onSubmit={handleRegister}>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => validateUsername(e.target.value)}
                    required
                    className="form-control mb-3"
                  />
                  {usernameError && (
                    <p style={{ color: "red", fontSize: "0.9rem" }}>
                      {usernameError}
                    </p>
                  )}
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => validateEmail(e.target.value)}
                    required
                    className="form-control mb-3"
                  />
                  {emailError && (
                    <p style={{ color: "red", fontSize: "0.9rem" }}>
                      {emailError}
                    </p>
                  )}
                  <div className="position-relative mb-3">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => checkPasswordStrength(e.target.value)}
                      required
                      className="form-control"
                      style={{ paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="btn btn-link position-absolute"
                      style={{
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "16px",
                      }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {showPasswordValidation && (
                    <div className="password-validation">
                      <p
                        style={{
                          color: passwordChecks.length ? "green" : "red",
                        }}
                      >
                        {passwordChecks.length ? "✓" : "✗"} At least 8
                        characters
                      </p>
                      <p
                        style={{
                          color: passwordChecks.uppercase ? "green" : "red",
                        }}
                      >
                        {passwordChecks.uppercase ? "✓" : "✗"} Contains an
                        uppercase letter
                      </p>
                      <p
                        style={{
                          color: passwordChecks.lowercase ? "green" : "red",
                        }}
                      >
                        {passwordChecks.lowercase ? "✓" : "✗"} Contains a
                        lowercase letter
                      </p>
                      <p
                        style={{
                          color: passwordChecks.number ? "green" : "red",
                        }}
                      >
                        {passwordChecks.number ? "✓" : "✗"} Contains a number
                      </p>
                      <p
                        style={{
                          color: passwordChecks.specialChar ? "green" : "red",
                        }}
                      >
                        {passwordChecks.specialChar ? "✓" : "✗"} Contains a
                        special character
                      </p>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={
                      !!usernameError ||
                      !!emailError ||
                      !Object.values(passwordChecks).every(Boolean)
                    }
                    className="btn btn-primary w-100"
                    style={{
                      backgroundColor: "#BE9986",
                      borderColor: "#B5C99A",
                    }}
                  >
                    Sign Up
                  </button>
                  <p
                    className="mt-3 text-center"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Already have an account?{" "}
                    <button
                      onClick={() => navigate("/login")}
                      className="btn btn-link"
                      style={{
                        fontSize: "0.9rem",
                      }}
                    >
                      Log in
                    </button>
                  </p>
                </form>
              </>
            ) : (
              <>
                <h2 className="mb-4 text-center">Verify Email</h2>
                <form onSubmit={handleVerifyCode}>
                  <p>
                    A verification code was sent to {email}. Enter the code
                    below:
                  </p>
                  <input
                    type="text"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    className="form-control mb-3"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    style={{
                      backgroundColor: "#BE9986",
                      borderColor: "#B5C99A",
                    }}
                  >
                    Verify Code
                  </button>
                </form>
              </>
            )}
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
