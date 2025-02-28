import { useEffect, useState, useContext } from "react";
import React, { Fragment } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Header from "../components/Header";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Legend,
  Cell,
} from "recharts";

const CURRENCY_SYMBOLS = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  BGN: "лв",
  CZK: "Kč",
  DKK: "kr",
  HUF: "Ft",
  ISK: "kr",
  NOK: "kr",
  PLN: "zł",
  RON: "lei",
  SEK: "kr",
  CHF: "CHF",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  NZD: "NZ$",
  SGD: "S$",
  HKD: "HK$",
};

const getCategoryColor = (cat) => {
  if (cat == "expense") return "#78281f";
  else if (cat == "income") return "#196f3d";
  else return "#2e4053";
};

const Transactions = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [summary, setSummary] = useState({
    total_expense: 0,
    total_income: 0,
    total_investment: 0,
  });
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [newTransaction, setNewTransaction] = useState({
    subcategory: "",
    amount: "",

    note: "",
    date: new Date().toISOString().split("T")[0], // Default to today
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchProfileAndTransactions = async () => {
      const [year, month] = selectedMonth.split("-");

      console.log("Token from localStorage:", token);
      console.log("User data from AuthContext:", user);
      console.log("Selected month:", month);

      if (!token) {
        setError("User is not authenticated.");
        setLoading(false);
        return;
      }

      if (!user) {
        return;
      }

      try {
        const profileResponse = await axios.get(
          "http://127.0.0.1:8000/api/financial-profile/",
          { headers }
        );
        console.log("Financial profile API Response:", profileResponse.data);

        const transactionsResponse = await axios.get(
          `http://127.0.0.1:8000/api/transactions/by-month/${year}/${month}/`,
          { headers }
        );

        console.log("Transactions API Response:", transactionsResponse.data);

        const userTransactions = transactionsResponse.data.filter(
          (t) => t.user === user.user_id
        );
        console.log("Filtered Transactions for User:", userTransactions);
        setTransactions(userTransactions);

        const userProfile = profileResponse.data.find(
          (p) => p.user === user.user_id
        );
        setProfile(userProfile || null);
      } catch (error) {
        console.error(
          "Error fetching user data:",
          error.response?.data || error.message
        );
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    const fetchSummary = async () => {
      const [year, month] = selectedMonth.split("-");

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/monthly-summary/${year}/${month}/`,
          { headers }
        );
        setSummary(response.data);
      } catch (error) {
        console.error("Error fetching monthly summary:", error);
      }
    };
    fetchSummary();
    fetchProfileAndTransactions();
  }, [user, selectedMonth]);

  const handleInputChange = (e) => {
    setNewTransaction({ ...newTransaction, [e.target.name]: e.target.value });
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();

    try {
      //POST request to create trans
      const response = await axios.post(
        "http://127.0.0.1:8000/api/transactions/",
        {
          user: user.user_id,
          subcategory: newTransaction.subcategory,
          amount: newTransaction.amount,

          note: newTransaction.note,
          date: newTransaction.date,
        },
        { headers }
      );

      setTransactions([...transactions, response.data]);
      setShowForm(false);
      setNewTransaction({
        subcategory: "",
        amount: "",

        note: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error(
        "Error adding transaction:",
        error.response?.data || error.message
      );
    }
  };

  const handleRowClick = (transaction) => {
    setSelectedTransaction({ ...transaction });
  };

  const handleEditChange = (e) => {
    setSelectedTransaction({
      ...selectedTransaction,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedTransaction) return;

    try {
      //update request to API
      const response = await axios.put(
        `http://127.0.0.1:8000/api/transactions/${selectedTransaction.id}/`,
        selectedTransaction,
        { headers }
      );

      setTransactions(
        transactions.map((t) =>
          t.id === selectedTransaction.id ? response.data : t
        )
      );
      setSelectedTransaction(null);
    } catch (error) {
      console.error(
        "Error updating transaction:",
        error.response?.data || error.message
      );
    }
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    try {
      //delete request to API
      await axios.delete(
        `http://127.0.0.1:8000/api/transactions/${selectedTransaction.id}/`,
        { headers }
      );

      setTransactions(
        transactions.filter((t) => t.id !== selectedTransaction.id)
      );
      setSelectedTransaction(null);
    } catch (error) {
      console.error(
        "Error deleting transaction:",
        error.response?.data || error.message
      );
    }
  };

  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      // key is date, value is array of transactions for that day
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  const spendingData =
    profile && profile.monthly_spending_goal
      ? [
          {
            name: "Spending",
            expense: summary.total_expense,
            remaining: profile.monthly_spending_goal - summary.total_expense,
          },
        ]
      : [];

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <Header />
      <h2>Your Transactions</h2>

      <label>Select Month:</label>
      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
      />
      {/* bar with spending goal */}
      {profile && profile.monthly_spending_goal && (
        <div>
          <h3>
            <strong>Monthly Spending Goal:</strong>{" "}
            {CURRENCY_SYMBOLS[profile.currency] || profile.currency}{" "}
            {profile.monthly_spending_goal}
          </h3>
          <ResponsiveContainer width="80%" height={100}>
            <BarChart
              layout="vertical"
              data={spendingData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[0, profile.monthly_spending_goal]}
                hide
              />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip />
              <Legend color="black" />
              {/* occupied */}
              <Bar dataKey="expense" stackId="a" fill="#3498db">
                <LabelList dataKey="expense" position="inside" fill="black" />
              </Bar>
              {/*  remaining  */}
              <Bar
                dataKey="remaining"
                stackId="a"
                fill="#d6eaf8"
                minPointSize={5}
              >
                <LabelList
                  dataKey="remaining"
                  position="insideLeft"
                  fill="black"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* show */}
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table border="1">
          <thead>
            <tr>
              <th width="120">Date</th>
              <th>Category</th>
              <th>Note</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedTransactions)
              .sort()
              .map((date) => (
                <React.Fragment key={date}>
                  <tr
                    style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}
                  >
                    <td colSpan="4">{date}</td>
                  </tr>
                  {groupedTransactions[date].map((transaction) => (
                    <tr
                      key={transaction.id}
                      onClick={() => handleRowClick(transaction)}
                      style={{ cursor: "pointer" }}
                    >
                      <td></td>
                      <td
                        style={{
                          color: getCategoryColor(transaction.category),
                        }}
                      >
                        {transaction.subcategory.replace("_", " ")}
                      </td>
                      <td>{transaction.note || ""}</td>
                      <td
                        style={{
                          color: getCategoryColor(transaction.category),
                        }}
                      >
                        {transaction.category === "expense" ? "-" : "+"}
                        {transaction.amount % 1 === 0
                          ? transaction.amount
                          : Number(transaction.amount).toFixed(2)}{" "}
                        {profile ? CURRENCY_SYMBOLS[profile.currency] : ""}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      )}

      {/* edit */}

      {selectedTransaction && (
        <div className="transaction-detail">
          <h3>Edit Transaction</h3>
          <label>
            Category:
            <select
              name="subcategory"
              value={selectedTransaction.subcategory}
              onChange={handleEditChange}
              required
            >
              <option value="">Select Category</option>
              <optgroup label="Income">
                <option value="salary">Salary</option>
                <option value="allowance">Allowance</option>
                <option value="investment_gain">Investment Gain</option>
                <option value="stipend">Stipend</option>
                <option value="sale_proceeds">Sale Proceeds</option>
                <option value="dividend">Dividend</option>
                <option value="other">Other</option>
              </optgroup>
              <optgroup label="Expense">
                <option value="grocery">Grocery</option>
                <option value="restaurant">Restaurant</option>
                <option value="entertainment">Entertainment</option>
                <option value="healthcare">Healthcare</option>
                <option value="utility">Utility</option>
                <option value="subscription">Subscription</option>
                <option value="gift">Gift</option>
                <option value="self_care">Self Care</option>
                <option value="housing">Housing</option>
                <option value="clothes">Clothes</option>
                <option value="miscellaneous">Miscellaneous</option>
              </optgroup>
              <optgroup label="Savings & Investment">
                <option value="stock">Stock</option>
                <option value="bond">Bond</option>
                <option value="crypto">Crypto</option>
                <option value="fund">Fund</option>
                <option value="real_estate">Real Estate</option>
                <option value="savings">Savings</option>
              </optgroup>
            </select>
          </label>
          <label>
            Amount:
            <input
              type="number"
              name="amount"
              value={selectedTransaction.amount}
              onChange={handleEditChange}
            />
          </label>

          <label>
            Note:
            <input
              type="text"
              name="note"
              value={selectedTransaction.note}
              onChange={handleEditChange}
            />
          </label>
          <label>
            Date:
            <input
              type="date"
              name="date"
              value={selectedTransaction.date}
              onChange={handleEditChange}
            />
          </label>
          <button onClick={handleSaveEdit}>Save</button>
          {/* delete */}
          <button
            onClick={handleDeleteTransaction}
            style={{
              marginLeft: "10px",
              backgroundColor: "red",
              color: "white",
            }}
          >
            Delete
          </button>
          <button onClick={() => setSelectedTransaction(null)}>Cancel</button>
        </div>
      )}

      {/* add */}
      <button onClick={() => setShowForm(!showForm)}>+</button>

      {showForm && (
        <form onSubmit={handleAddTransaction}>
          <label>
            Category:
            <select
              name="subcategory"
              value={newTransaction.subcategory}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Category</option>
              <optgroup label="Income">
                <option value="salary">Salary</option>
                <option value="allowance">Allowance</option>
                <option value="investment_gain">Investment Gain</option>
                <option value="stipend">Stipend</option>
                <option value="sale_proceeds">Sale Proceeds</option>
                <option value="dividend">Dividend</option>
                <option value="other">Other</option>
              </optgroup>
              <optgroup label="Expense">
                <option value="grocery">Grocery</option>
                <option value="restaurant">Restaurant</option>
                <option value="entertainment">Entertainment</option>
                <option value="healthcare">Healthcare</option>
                <option value="utility">Utility</option>
                <option value="subscription">Subscription</option>
                <option value="gift">Gift</option>
                <option value="self_care">Self Care</option>
                <option value="housing">Housing</option>
                <option value="clothes">Clothes</option>
                <option value="miscellaneous">Miscellaneous</option>
              </optgroup>
              <optgroup label="Savings & Investment">
                <option value="stock">Stock</option>
                <option value="bond">Bond</option>
                <option value="crypto">Crypto</option>
                <option value="fund">Fund</option>
                <option value="real_estate">Real Estate</option>
                <option value="savings">Savings</option>
              </optgroup>
            </select>
          </label>
          <label>
            Amount:{" "}
            <input
              type="number"
              name="amount"
              value={newTransaction.amount}
              onChange={handleInputChange}
              required
            />
          </label>

          <label>
            Note:{" "}
            <input
              type="text"
              name="note"
              value={newTransaction.note}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Date:{" "}
            <input
              type="date"
              name="date"
              value={newTransaction.date}
              onChange={handleInputChange}
              required
            />
          </label>
          <button type="submit">Add Transaction</button>
        </form>
      )}
    </div>
  );
};

export default Transactions;
