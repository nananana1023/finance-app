import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Header */}
      <h1 style={styles.header}>MoneySavvy</h1>

      {/* Buttons */}
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={() => navigate("/login")}>
          Log In
        </button>
        <button style={styles.button} onClick={() => navigate("/register")}>
          Sign Up
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
  },
  header: {
    fontSize: "2rem",
    marginBottom: "20px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    cursor: "pointer",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "blue",
    color: "white",
  },
};

export default Home;
