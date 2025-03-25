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
  LabelList,
  Legend,
  Cell,
} from "recharts";
import MonthContext from "../context/MonthContext";
import "../index.css";
import PaginatedTable from "./PaginatedTable";
import Calculator from "./Calculator";
import FileUpload from "./FileUpload";
import { evaluate } from "mathjs";

const Transactions = () => {
  const { user, CURRENCY_SYMBOLS } = useContext(AuthContext);
  const { fetchSummary, summary } = useContext(FetchContext);
  const [transactions, setTransactions] = useState([]);
  const [allTransUser, setAllTransactions] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { selectedMonth, setSelectedMonth, handleNextMonth, handlePrevMonth } =
    useContext(MonthContext);
  const [error, setError] = useState(null);
  const [originalTransaction, setOriginalTransaction] = useState(null);
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [showForm, setShowForm] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(profile?.currency);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [showCustomRateField, setShowCustomRateField] = useState(false);
  const [customExchangeRate, setCustomExchangeRate] = useState("");
  const [showCalculator, setShowCalculator] = useState("");

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
        const allTrans = await axios.get(
          `http://127.0.0.1:8000/api/transactions/`,
          { headers }
        );

        const userTransactions = transactionsResponse.data.filter(
          (t) => t.user === user.user_id
        );

        const userAllTrans = allTrans.data.filter(
          (t) => t.user === user.user_id
        );

        setTransactions(userTransactions);
        setAllTransactions(userAllTrans);

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

  const groupedAllTransactions = allTransUser.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
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
          amount: convertedAmount || newTransaction.amount,
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

        setSuccessMessage(
          `This transaction will be automatically deducted every month on day ${day}.`
        );

        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
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
    setSelectedCurrency(profile?.currency);
    setConvertedAmount(null);
    setShowCustomRateField(false);
    setCustomExchangeRate("");
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
      const updatedAmount =
        selectedCurrency !== profile?.currency && convertedAmount !== null
          ? convertedAmount
          : selectedTransaction.amount;
      const updatedTransaction = {
        ...selectedTransaction,
        amount: updatedAmount,
      };

      const response = await axios.put(
        `http://127.0.0.1:8000/api/transactions/${selectedTransaction.id}/`,
        updatedTransaction,
        { headers }
      );
      setTransactions(
        transactions.map((t) =>
          t.id === selectedTransaction.id ? response.data : t
        )
      );

      //if recurring was on and updated to off
      if (originalTransaction.recurring && !selectedTransaction.recurring) {
        setSuccessMessage("All future recurring transactions are disabled.");

        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      }

      // if recurring is on
      if (selectedTransaction.recurring) {
        let day = new Date(selectedTransaction.date).getDate();
        if (day > 28) day = 28;
        setSuccessMessage(
          `This transaction will be automatically added every month on day ${day}.`
        );
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
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
        setSuccessMessage("All future recurring transactions are disabled.");
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);

        setSelectedTransaction(null);
      }
    } catch (err) {
      console.error(
        "Error deleting transaction:",
        err.response?.data || err.message
      );
    }
  };

  const handleEditAmountChange = (e) => {
    const value = e.target.value;
    setSelectedTransaction((prev) => ({ ...prev, amount: value }));
    if (value) {
      convertAmount(selectedCurrency, value);
    } else {
      setConvertedAmount(null);
    }
  };

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const convertAmount = async (sourceCurrency, amount) => {
    // if custom rate is chosen
    if (showCustomRateField && customExchangeRate) {
      const converted = amount * Number(customExchangeRate);
      setConvertedAmount(Number(converted.toFixed(2)));
      return;
    }
    // otherwise get rate from API
    try {
      const response = await fetch(
        `https://openexchangerates.org/api/latest.json?app_id=9ffddd5f54f046a0870f20c1633b320b`
      );
      const data = await response.json();
      if (data && data.rates) {
        const rates = data.rates;
        const rateSource = rates[sourceCurrency];
        const rateTarget = rates[profile?.currency];
        if (rateTarget && rateSource) {
          const converted = amount * (rateTarget / rateSource);
          setConvertedAmount(Number(converted.toFixed(2)));
        }
      }
    } catch (error) {
      console.error("Error converting amount:", error);
    }
  };

  const handleCustomRateChange = (e) => {
    const rate = e.target.value;
    setCustomExchangeRate(rate);
    if (newTransaction.amount) {
      const converted = newTransaction.amount * Number(rate);
      setConvertedAmount(Number(converted.toFixed(2)));
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setNewTransaction((prev) => ({ ...prev, amount: value }));
    if (value) {
      convertAmount(selectedCurrency, value);
    } else {
      setConvertedAmount(null);
    }
  };

  const handleEditCurrencyChange = (e) => {
    const currency = e.target.value;
    setSelectedCurrency(currency);
    if (selectedTransaction && selectedTransaction.amount) {
      convertAmount(currency, selectedTransaction.amount);
    }
  };

  const handleCurrencyChange = (e) => {
    const currency = e.target.value;
    setSelectedCurrency(currency);
    if (newTransaction.amount) {
      convertAmount(currency, newTransaction.amount);
    }
  };

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
      <h3>
        <strong>Monthly Spending Goal:</strong> {profile?.monthly_spending_goal}
        {CURRENCY_SYMBOLS[profile.currency] || profile.currency}
      </h3>

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
                      `${value.toFixed(2)}${
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
                ></Bar>
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
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {successMessage && (
        <p
          style={{
            color: "green",
            background: "#d4edda",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          {successMessage}
        </p>
      )}

      {/* file upload */}
      <section>
        <FileUpload />
      </section>

      {/* Show transactions */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: "1" }}>
          <h3>Your Transactions</h3>
          {Object.keys(groupedTransactions).length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <PaginatedTable
              groupedTransactions={groupedTransactions}
              handleRowClick={handleRowClick}
              profile={profile}
              itemsPerPage={15}
              type={"trans"}
            />
          )}
        </div>

        {/* recurring trans this month*/}
        {selectedMonth === currentMonthStr && (
          <div style={{ flex: "1" }}>
            <PaginatedTable
              groupedTransactions={groupedAllTransactions}
              handleRowClick={handleRowClick}
              profile={profile}
              itemsPerPage={10}
              type={"recur"}
            />
          </div>
        )}
      </div>

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
            Amount:{" "}
            <input
              type="number"
              name="amount"
              value={selectedTransaction.amount}
              onChange={handleEditAmountChange}
              required
            />
          </label>
          <label style={{ marginLeft: "10px" }}>
            Currency:
            <select
              name="currency"
              value={selectedCurrency}
              onChange={handleEditCurrencyChange} // Use the dedicated handler
            >
              {profile && profile.currency ? (
                <>
                  <option key={profile.currency} value={profile.currency}>
                    {profile.currency}
                  </option>
                  {Object.entries(CURRENCY_SYMBOLS)
                    .filter(([code]) => code !== profile.currency)
                    .map(([code]) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                </>
              ) : (
                Object.entries(CURRENCY_SYMBOLS).map(([code]) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))
              )}
            </select>
          </label>

          {/* Button for custom exchange rate */}
          <div style={{ marginTop: "10px" }}>
            <button
              type="button"
              onClick={() => {
                setShowCustomRateField(!showCustomRateField);
                if (showCustomRateField) {
                  setCustomExchangeRate("");
                  if (selectedTransaction.amount) {
                    convertAmount(selectedCurrency, selectedTransaction.amount);
                  }
                }
              }}
            >
              {showCustomRateField
                ? "Remove Custom Rate"
                : "Set Custom Exchange Rate"}
            </button>
          </div>

          {/* Custom exchange rate input */}
          {showCustomRateField && (
            <div style={{ marginTop: "10px" }}>
              <label>
                Custom Exchange Rate:
                <input
                  type="number"
                  step="0.01"
                  value={customExchangeRate}
                  onChange={(e) => {
                    const rate = e.target.value;
                    setCustomExchangeRate(rate);
                    if (selectedTransaction.amount) {
                      const converted =
                        selectedTransaction.amount * Number(rate);
                      setConvertedAmount(Number(converted.toFixed(2)));
                    }
                  }}
                />
              </label>
            </div>
          )}

          {/* Show converted amount if applicable */}
          {convertedAmount !== null &&
            selectedCurrency !== profile?.currency && (
              <div style={{ marginTop: "10px" }}>
                <p>
                  Converted Amount: {convertedAmount.toFixed(2)}{" "}
                  {profile?.currency}
                </p>
              </div>
            )}

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
      <div style={{ marginBottom: "100px" }}>
        <button
          onClick={() =>
            setShowForm((prev) => {
              const newShow = !prev;
              if (newShow) {
                // Reset currency to default and clear converted amount
                setSelectedCurrency(profile?.currency);
                setConvertedAmount(null);
                setShowCustomRateField(false);
                setCustomExchangeRate("");
              }
              return newShow;
            })
          }
        >
          +
        </button>
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

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "10px",
              }}
            >
              <label>
                Amount:{" "}
                <input
                  type="number"
                  name="amount"
                  value={newTransaction.amount}
                  onChange={handleAmountChange}
                  required
                />
              </label>

              {/* calcualtor */}
              <button
                type="button"
                onClick={() => setShowCalculator(!showCalculator)}
                style={{ marginLeft: "10px" }}
              >
                {showCalculator ? "Hide Calculator" : "Open Calculator"}
              </button>

              {showCalculator && (
                <Calculator
                  onResult={(result) => {
                    // Set the amount from the calculator result.
                    setNewTransaction((prev) => ({ ...prev, amount: result }));
                    setShowCalculator(false);
                  }}
                  onClose={() => setShowCalculator(false)}
                />
              )}

              <label style={{ marginLeft: "10px" }}>
                Currency:
                <select
                  name="currency"
                  value={selectedCurrency}
                  onChange={handleCurrencyChange}
                >
                  {profile && profile.currency ? (
                    <>
                      <option key={profile.currency} value={profile.currency}>
                        {profile.currency}
                      </option>
                      {Object.entries(CURRENCY_SYMBOLS)
                        .filter(([code]) => code !== profile.currency)
                        .map(([code]) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                    </>
                  ) : (
                    Object.entries(CURRENCY_SYMBOLS).map(([code]) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))
                  )}
                </select>
              </label>
            </div>

            {/* Button for custom exchange rate */}
            <div style={{ marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setShowCustomRateField(!showCustomRateField);
                  if (showCustomRateField) {
                    setCustomExchangeRate("");
                    if (newTransaction.amount) {
                      convertAmount(selectedCurrency, newTransaction.amount);
                    }
                  }
                }}
              >
                {showCustomRateField
                  ? "Remove Custom Rate"
                  : "Set Custom Exchange Rate"}
              </button>
            </div>

            {/* custom exchange rate input */}
            {showCustomRateField && (
              <div style={{ marginTop: "10px" }}>
                <label>
                  Custom Exchange Rate:
                  <input
                    type="number"
                    step="0.01"
                    value={customExchangeRate}
                    onChange={handleCustomRateChange}
                  />
                </label>
              </div>
            )}

            {/* show converted amount if selected cur is different from default cur */}
            {convertedAmount !== null &&
              selectedCurrency !== profile?.currency && (
                <div style={{ marginTop: "10px" }}>
                  <p>
                    Converted Amount: {convertedAmount.toFixed(2)}{" "}
                    {profile?.currency}
                  </p>
                </div>
              )}

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
      </div>
    </div>
  );
};

export default Transactions;
