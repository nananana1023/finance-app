import { Link } from "react-router-dom";
import "../styles/Header.css"; // Add styles

const Header = () => {
  return (
    <nav className="header">
      <h1>💸 MoneySavvy</h1>
      <ul>
        <li>
          <Link to="/userhome">Home</Link>
        </li>
        <li>
          <Link to="/transactions">Transactions</Link>
        </li>
        <li>
          <Link to="/insights">Insights</Link>
        </li>
        <li>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
