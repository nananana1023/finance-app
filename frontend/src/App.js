import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import UserHome from "./pages/UserHome";
import Transactions from "./pages/Transactions";
import Insights from "./pages/Insights";
import Profile from "./pages/Profile";
import { MonthProvider } from "./context/MonthContext";

function App() {
  return (
    <Router>
      {" "}
      <AuthProvider>
        <MonthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/userhome" element={<UserHome />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </MonthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
