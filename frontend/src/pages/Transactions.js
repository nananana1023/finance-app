import { useEffect, useState, useContext, Fragment } from "react";
import React from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import FetchContext from "../context/FetchContext";
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
import MonthContext from "../context/MonthContext";
import "../index.css";

const getCategoryColor = (cat) => {
  if (cat === "expense") return "#78281f";
  else if (cat === "income") return "#196f3d";
  else return "#2e4053";
};

const Transactions = () => {
  const { user, CURRENCY_SYMBOLS } = useContext(AuthContext);
  const { fetchSummary, summary } = useContext(FetchContext);
  const [transactions, setTransactions] = useState([]);
  const [investments, setInvest] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { selectedMonth, setSelectedMonth, handleNextMonth, handlePrevMonth } =
    useContext(MonthContext);
  const [error, setError] = useState(null);
  const [originalTransaction, setOriginalTransaction] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    subcategory: "",
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
    recurring: false,
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const token = localStorage.getItem("accessToken");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchProfileAndTransactions = async () => {
      const [year, month] = selectedMonth.split("-");

      if (!token) {
        setError("User is not authenticated.");
        setLoading(false);
        return;
      }
      if (!user) return;

      try {
        const profileResponse = await axios.get(
          "http://127.0.0.1:8000/api/financial-profile/",
          { headers }
        );
        const transactionsResponse = await axios.get(
          `http://127.0.0.1:8000/api/transactions/by-month/${year}/${month}/`,
          { headers }
        );

        const userTransactions = transactionsResponse.data.filter(
          (t) => t.user === user.user_id && t.category !== "savings_investment"
        );
        const userInvestment = transactionsResponse.data.filter(
          (t) => t.user === user.user_id && t.category === "savings_investment"
        );

        setTransactions(userTransactions);
        setInvest(userInvestment);

        const userProfile = profileResponse.data.find(
          (p) => p.user === user.user_id
        );
        setProfile(userProfile || null);
      } catch (err) {
        console.error(
          "Error fetching user data:",
          err.response?.data || err.message
        );
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
    fetchProfileAndTransactions();
  }, [user, selectedMonth, selectedTransaction, newTransaction]);

  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  const groupedInvestments = investments.reduce((groups, t) => {
    const date = t.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(t);
    return groups;
  }, {});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTransaction({
      ...newTransaction,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/transactions/",
        {
          user: user.user_id,
          subcategory: newTransaction.subcategory,
          amount: newTransaction.amount,
          note: newTransaction.note,
          date: newTransaction.date,
          recurring: newTransaction.recurring,
        },
        { headers }
      );
      setTransactions([...transactions, response.data]);
      setShowForm(false);

      // if recurring is on display message
      if (newTransaction.recurring) {
        let day = new Date(newTransaction.date).getDate();
        if (day > 28) day = 28;

        window.alert(
          `This transaction will be automatically deducted every month on day ${day}.`
        );
      }

      setNewTransaction({
        subcategory: "",
        amount: "",
        note: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      console.error(
        "Error adding transaction:",
        err.response?.data || err.message
      );
    }
  };

  const handleRowClick = (transaction) => {
    setSelectedTransaction({ ...transaction });
    setOriginalTransaction({ ...transaction });
    console.log("Selected transaction: ", transaction);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedTransaction({
      ...selectedTransaction,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedTransaction) return;
    try {
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

      //if recurring was on and updated to off
      if (originalTransaction.recurring && !selectedTransaction.recurring) {
        window.alert(`All future recurring transactions are disabled.`);
      }

      // if recurring is on
      if (selectedTransaction.recurring) {
        let day = new Date(selectedTransaction.date).getDate();
        if (day > 28) day = 28;

        window.alert(
          `This transaction will be automatically deducted every month on day ${day}.`
        );
      }

      setOriginalTransaction(null);
      setSelectedTransaction(null);
    } catch (err) {
      console.error(
        "Error updating transaction:",
        err.response?.data || err.message
      );
    }
  };

  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/transactions/${selectedTransaction.id}/`,
        { headers }
      );
      setTransactions(
        transactions.filter((t) => t.id !== selectedTransaction.id)
      );
      // if recurring trans is deleted
      if (selectedTransaction.recurring) {
        window.alert(`All future recurring transactions are disabled.`);

        setSelectedTransaction(null);
      }
    } catch (err) {
      console.error(
        "Error deleting transaction:",
        err.response?.data || err.message
      );
    }
  };

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const spendingData =
    profile && profile.monthly_spending_goal
      ? [
          {
            Expense: summary.total_expense,
            Overspent:
              summary.total_expense > profile.monthly_spending_goal
                ? summary.total_expense - profile.monthly_spending_goal
                : 0,
            Remaining: profile.monthly_spending_goal - summary.total_expense,
          },
        ]
      : [];

  return (
    <div>
      <Header />

      {/* select month  */}

      <div style={{ marginTop: 50, display: "flex", alignItems: "center" }}>
        <button onClick={handlePrevMonth}>{"<"}</button>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ margin: "0 10px" }}
        />
        <button onClick={handleNextMonth}>{">"}</button>
      </div>

      {/* Bar with spending goal */}
      {profile && profile.monthly_spending_goal && (
        <div>
          <h3>
            <strong>Monthly Spending Goal:</strong>{" "}
            {profile.monthly_spending_goal}
            {CURRENCY_SYMBOLS[profile.currency] || profile.currency}
          </h3>
          {/* overspent case */}
          {summary.total_expense > profile.monthly_spending_goal ? (
            <ResponsiveContainer width="80%" height={100}>
              <BarChart
                layout="vertical"
                data={spendingData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <XAxis type="number" domain={[0, summary.total_expense]} hide />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip />
                {/* <Legend /> */}

                <Bar
                  dataKey="Overspent"
                  stackId="a"
                  fill="#FF0000"
                  name="Overspent"
                  radius={[20, 0, 0, 20]}
                >
                  <LabelList
                    dataKey="Overspent"
                    position="inside"
                    fill="black"
                    formatter={(value) =>
                      `${value}${
                        CURRENCY_SYMBOLS[profile.currency] || profile.currency
                      }`
                    }
                  />
                </Bar>

                <Bar
                  dataKey="Expense"
                  stackId="a"
                  fill="#FFCCCC"
                  name="Expense"
                  radius={[0, 20, 20, 0]}
                >
                  {/* <LabelList
                    dataKey="Expense"
                    position="inside"
                    fill="black"
                    formatter={(value) =>
                      `${value}${
                        CURRENCY_SYMBOLS[profile.currency] || profile.currency
                      }`
                    }
                  /> */}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            // within spending case

            <ResponsiveContainer width="80%" height={100}>
              <BarChart
                layout="vertical"
                data={spendingData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <XAxis
                  type="number"
                  domain={[0, profile.monthly_spending_goal]}
                  hide
                />
                <YAxis type="category" dataKey="name" hide />
                {/* <Legend /> */}
                <Tooltip />

                {spendingData.length && spendingData[0].Expense !== 0 && (
                  <Bar dataKey="Expense" stackId="a" radius={[20, 0, 0, 20]}>
                    {spendingData.map((entry, index) => {
                      const fillColor =
                        entry.Expense < profile.monthly_spending_goal / 2
                          ? "#28b463"
                          : "#3498db";
                      return <Cell key={`cell-${index}`} fill={fillColor} />;
                    })}
                    <LabelList
                      dataKey="Expense"
                      position="inside"
                      fill="black"
                      formatter={(value) =>
                        `${value}${
                          CURRENCY_SYMBOLS[profile.currency] || profile.currency
                        }`
                      }
                    />
                  </Bar>
                )}

                <Bar dataKey="Remaining" stackId="a" radius={[0, 20, 20, 0]}>
                  {" "}
                  {spendingData.map((entry, index) => {
                    const fillColor =
                      entry.Expense < profile.monthly_spending_goal / 2
                        ? "#d5f5e3"
                        : "#aed6f1";
                    return <Cell key={`cell-${index}`} fill={fillColor} />;
                  })}
                  {/* <LabelList
                    dataKey="remaining"
                    position="inside"
                    fill="black"
                    formatter={(value) =>
                      `${value}${
                        CURRENCY_SYMBOLS[profile.currency] || profile.currency
                      }`
                    }
                  /> */}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      <h3>Your Transactions</h3>

      {/* Show transactions */}
      {Object.keys(groupedTransactions).length === 0 ? (
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
                <Fragment key={date}>
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
                </Fragment>
              ))}
          </tbody>
        </table>
      )}

      {/* Edit transaction */}
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
          <label className="switch">
            Recurring Transaction:
            <input
              type="checkbox"
              name="recurring"
              checked={selectedTransaction.recurring}
              onChange={handleEditChange}
            />
            <span className="slider round"></span>
          </label>
          <button onClick={handleSaveEdit}>Save</button>
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

      {/* Add transaction */}
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
          <label className="switch">
            Recurring Transaction:
            <input
              type="checkbox"
              name="recurring"
              checked={newTransaction.recurring}
              onChange={handleInputChange}
            />
            <span className="slider round"></span>
          </label>

          <button type="submit">Add Transaction</button>
        </form>
      )}

      {/* Show investment history */}
      <div>
        {Object.keys(groupedInvestments).length === 0 ? (
          <p></p>
        ) : (
          <>
            <h2>Your investment history</h2>
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
                {Object.keys(groupedInvestments)
                  .sort()
                  .map((date) => (
                    <React.Fragment key={date}>
                      <tr
                        style={{
                          backgroundColor: "#f0f0f0",
                          fontWeight: "bold",
                        }}
                      >
                        <td colSpan="4">{date}</td>
                      </tr>
                      {groupedInvestments[date].map((t) => (
                        <tr
                          key={t.id}
                          onClick={() => handleRowClick(t)}
                          style={{ cursor: "pointer" }}
                        >
                          <td></td>
                          <td style={{ color: getCategoryColor(t.category) }}>
                            {t.subcategory.replace("_", " ")}
                          </td>
                          <td>{t.note || ""}</td>
                          <td style={{ color: getCategoryColor(t.category) }}>
                            {t.amount % 1 === 0
                              ? t.amount
                              : Number(t.amount).toFixed(2)}{" "}
                            {profile ? CURRENCY_SYMBOLS[profile.currency] : ""}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default Transactions;
