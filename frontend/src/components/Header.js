import { Link } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  return (
    <>
      <nav
        className="navbar navbar-expand-lg"
        style={{
          backgroundColor: "#A5BB9F",
          fontFamily: "Monospace",
          fontSize: "16px",
        }}
      >
        <div className="container">
          <Link
            className="navbar-brand"
            to="/userhome"
            style={{ fontSize: "20px" }}
          >
            <img
              src="/banknote.ico"
              alt="Banknote"
              width="30"
              height="30"
              className="d-inline-block align-top me-2"
            />
            MoneySavvy
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/userhome">
                  Overview
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/transactions">
                  Transactions
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/insights">
                  Insights
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/profile">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
