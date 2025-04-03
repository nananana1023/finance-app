import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import "../styles/login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
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
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setError(error.response?.data?.error || "Invalid Credentials.");
    }
  };

  return (
    <Container fluid className="vh-100" style={{ backgroundColor: "#E9E9DF" }}>
      <Row className="h-100">
        <Col
          md={6}
          className="d-flex flex-column justify-content-center align-items-center text-center"
          style={{
            backgroundColor: "#A5BB9F",
            animation: "fadeIn 1s",
          }}
        >
          <h1 style={{ fontWeight: 700 }}>MoneySavvy</h1>
          <p>Know your money. Control your future.</p>
        </Col>

        <Col
          md={6}
          className="d-flex flex-column justify-content-center align-items-center"
        >
          <div className="w-75">
            <h2 className="mb-4 text-center">Log In</h2>
            {successMessage && (
              <p className="text-success text-center">{successMessage}</p>
            )}
            {error && <p className="text-danger text-center">{error}</p>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Control
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group
                className="mb-3 position-relative"
                controlId="formPassword"
              >
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  variant="link"
                  onClick={() => setShowPassword(!showPassword)}
                  className="position-absolute top-50 end-0 translate-middle-y me-2 p-0"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </Button>
              </Form.Group>
              <div className="d-grid">
                <Button
                  type="submit"
                  style={{
                    backgroundColor: "#BE9986",
                    borderColor: "#B5C99A",
                  }}
                  disabled={!username || !password}
                >
                  Log In
                </Button>
              </div>
            </Form>
            <p className="mt-3 text-center">
              Don't have an account?{" "}
              <Button variant="link" onClick={() => navigate("/register")}>
                Sign Up
              </Button>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
