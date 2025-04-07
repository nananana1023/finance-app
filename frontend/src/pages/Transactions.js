import { useEffect, useState, useContext } from "react";
import React from "react";
import AuthContext from "../context/AuthContext";
import FetchContext from "../context/FetchContext";
import Header from "../components/Header";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import MonthContext from "../context/MonthContext";
import "../index.css";
import PaginatedTable from "./PaginatedTable";
import Calculator from "./Calculator";
import FileUpload from "./FileUpload";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import api from "../utils/api";

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
  const [selectedCurrency, setSelectedCurrency] = useState(profile?.currency);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [showCustomRateField, setShowCustomRateField] = useState(false);
  const [customExchangeRate, setCustomExchangeRate] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [newTransaction, setNewTransaction] = useState({
    subcategory: "",
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
    recurring: false,
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchProfileAndTransactions = async () => {
      const [year, month] = selectedMonth.split("-");

      if (!token) {
        setError("User is not authenticated.");
        setLoading(false);
        return;
      }
      if (!user) {
        return;
      }

      try {
        const profileResponse = await api.get("financial-profile/");
        const transactionsResponse = await api.get(
          `transactions/by-month/${year}/${month}/`
        );
        const allTrans = await api.get(`transactions/`);

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
      const response = await api.post("transactions/", {
        user: user.user_id,
        subcategory: newTransaction.subcategory,
        amount: convertedAmount || newTransaction.amount,
        note: newTransaction.note,
        date: newTransaction.date,
        recurring: newTransaction.recurring,
      });
      setTransactions([...transactions, response.data]);
      setActiveTab(null); // close the modal

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
        recurring: false,
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

      const response = await api.put(
        `transactions/${selectedTransaction.id}/`,
        updatedTransaction
      );
      setTransactions(
        transactions.map((t) =>
          t.id === selectedTransaction.id ? response.data : t
        )
      );

      if (originalTransaction.recurring && !selectedTransaction.recurring) {
        setSuccessMessage("All future recurring transactions are disabled.");
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      }

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
      await api.delete(`transactions/${selectedTransaction.id}/`);
      setTransactions(
        transactions.filter((t) => t.id !== selectedTransaction.id)
      );
      if (selectedTransaction.recurring) {
        setSuccessMessage("All future recurring transactions are disabled.");
        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      }
      setSelectedTransaction(null);
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

  const convertAmount = async (sourceCurrency, amount) => {
    if (showCustomRateField && customExchangeRate) {
      const converted = amount * Number(customExchangeRate);
      setConvertedAmount(Number(converted.toFixed(2)));
      return;
    }
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

  const handleExport = () => {
    const exportData = [];
    for (const date in groupedTransactions) {
      groupedTransactions[date].forEach((transaction) => {
        exportData.push({
          Date: transaction.date,
          Subcategory: transaction.subcategory,
          Amount: transaction.amount,
          Note: transaction.note,
          Recurring: transaction.recurring ? "Yes" : "No",
        });
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    const filename = `Transactions_${selectedMonth}.xlsx`;
    XLSX.writeFile(workbook, filename);
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

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // Modal overlay style
  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        fontFamily: "monospace",
      }}
    >
      <Header />
      <Container className="py-5">
        {/* Monthly Spending and Month Selector */}
        <Row className="mb-4">
          <Col>
            <h3>
              <strong>Monthly Spending Goal:</strong>{" "}
              {profile?.monthly_spending_goal}
              {CURRENCY_SYMBOLS[profile?.currency] || profile?.currency}
            </h3>
          </Col>
        </Row>
        <InputGroup className="mb-5" style={{ maxWidth: "300px" }}>
          <Button variant="outline-secondary" onClick={handlePrevMonth}>
            &lt;
          </Button>
          <Form.Control
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <Button variant="outline-secondary" onClick={handleNextMonth}>
            &gt;
          </Button>
        </InputGroup>

        {/* Spending Bar Chart */}
        {profile && profile.monthly_spending_goal && (
          <Row className="mb-5">
            <Col className="d-flex justify-content-center">
              {summary.total_expense > profile.monthly_spending_goal ? (
                <ResponsiveContainer width="80%" height={100}>
                  <BarChart
                    layout="vertical"
                    data={spendingData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <XAxis
                      type="number"
                      domain={[0, summary.total_expense]}
                      hide
                    />
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
                        fill="white"
                        formatter={(value) =>
                          `${value.toFixed(2)}${
                            CURRENCY_SYMBOLS[profile.currency] ||
                            profile.currency
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
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
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
                      <Bar
                        dataKey="Expense"
                        stackId="a"
                        radius={[20, 0, 0, 20]}
                      >
                        {spendingData.map((entry, index) => {
                          const fillColor =
                            entry.Expense < profile.monthly_spending_goal / 2
                              ? "#28b463"
                              : "#3498db";
                          return (
                            <Cell key={`cell-${index}`} fill={fillColor} />
                          );
                        })}
                        <LabelList
                          dataKey="Expense"
                          position="inside"
                          fill="white"
                          formatter={(value) =>
                            `${value}${
                              CURRENCY_SYMBOLS[profile.currency] ||
                              profile.currency
                            }`
                          }
                        />
                      </Bar>
                    )}
                    <Bar
                      dataKey="Remaining"
                      stackId="a"
                      radius={[0, 20, 20, 0]}
                    >
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
            </Col>
          </Row>
        )}

        {/* Success Message */}
        {successMessage && (
          <Row className="mb-4">
            <Col>
              <div className="alert alert-success" role="alert">
                {successMessage}
              </div>
            </Col>
          </Row>
        )}

        {/*modal buttons */}
        <Row className="mb-5">
          <Col className="d-flex justify-content-center">
            <Button
              variant={activeTab === "upload" ? "primary" : "secondary"}
              style={{
                backgroundColor: "#D9C9B3",
                color: "black",
                border: "none",
              }}
              className="btn-animate me-2"
              onClick={() => setActiveTab("upload")}
            >
              File Upload
            </Button>
            <Button
              variant={activeTab === "manual" ? "primary" : "secondary"}
              style={{
                backgroundColor: "#D9C9B3",
                color: "black",
                border: "none",
              }}
              className="btn-animate me-2"
              onClick={() => setActiveTab("manual")}
            >
              Add Transaction
            </Button>
          </Col>
        </Row>

        {/* File Upload */}
        {activeTab === "upload" && (
          <div style={modalOverlayStyle}>
            <Card
              style={{
                backgroundColor: "#E9E9DF",
                padding: "20px",
                borderRadius: "8px",
                width: "90%",
                maxWidth: "700px",
                position: "relative",
              }}
            >
              <Button
                variant="link"
                onClick={() => setActiveTab(null)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  fontSize: "1.5rem",
                  color: "black",
                  textDecoration: "none",
                }}
              >
                &times;
              </Button>
              <section>
                <FileUpload />
              </section>
            </Card>
          </div>
        )}

        {/*Add Transaction  */}
        {activeTab === "manual" && (
          <div style={modalOverlayStyle}>
            <Card
              style={{
                backgroundColor: "#E9E9DF",
                padding: "20px",
                borderRadius: "8px",
                width: "90%",
                maxWidth: "800px",
                position: "relative",
              }}
            >
              <Button
                variant="link"
                onClick={() => setActiveTab(null)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  fontSize: "1.5rem",
                  color: "black",
                  textDecoration: "none",
                }}
              >
                &times;
              </Button>
              <h3>Add Transaction</h3>
              <Form onSubmit={handleAddTransaction}>
                <Form.Group className="mb-3">
                  <Form.Label>Category:</Form.Label>
                  <Form.Select
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
                  </Form.Select>
                </Form.Group>

                <Row className="mb-3 align-items-center">
                  <Col xs="auto">
                    <Form.Group>
                      <Form.Label>Amount:</Form.Label>
                      <Form.Control
                        type="number"
                        name="amount"
                        value={newTransaction.amount}
                        onChange={handleAmountChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col xs="auto" className="mx-2">
                    <Form.Group>
                      <Form.Label>Currency:</Form.Label>
                      <Form.Select
                        name="currency"
                        value={selectedCurrency}
                        onChange={handleCurrencyChange}
                      >
                        {profile && profile.currency ? (
                          <>
                            <option value={profile.currency}>
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
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  {convertedAmount !== null &&
                    selectedCurrency !== profile?.currency && (
                      <Col xs="auto">
                        <Form.Group>
                          <Form.Label>Converted Amount:</Form.Label>
                          <Form.Control
                            value={
                              convertedAmount !== null
                                ? convertedAmount.toFixed(2) +
                                  " " +
                                  profile?.currency
                                : ""
                            }
                            readOnly
                          />
                        </Form.Group>
                      </Col>
                    )}
                </Row>

                <Row className="mb-3 align-items-center">
                  <Col xs="auto">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowCustomRateField(!showCustomRateField);
                        if (showCustomRateField) {
                          setCustomExchangeRate("");
                          if (newTransaction.amount) {
                            convertAmount(
                              selectedCurrency,
                              newTransaction.amount
                            );
                          }
                        }
                      }}
                    >
                      {showCustomRateField
                        ? "Remove Custom Rate"
                        : "Set Custom Exchange Rate"}
                    </Button>
                  </Col>

                  {showCustomRateField && (
                    <Col xs="auto">
                      <Form.Group className="mb-0">
                        <Form.Label>Custom Exchange Rate:</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={customExchangeRate}
                          onChange={handleCustomRateChange}
                        />
                      </Form.Group>
                    </Col>
                  )}

                  <Col xs="auto">
                    <Button
                      type="button"
                      onClick={() => setShowCalculator(!showCalculator)}
                      variant="outline-secondary"
                    >
                      {showCalculator ? "Hide Calculator" : "Calculator"}
                    </Button>
                  </Col>

                  {showCalculator && (
                    <Col xs="auto">
                      <Calculator
                        onResult={(result) => {
                          setNewTransaction((prev) => ({
                            ...prev,
                            amount: result,
                          }));
                          setShowCalculator(false);
                        }}
                        onClose={() => setShowCalculator(false)}
                      />
                    </Col>
                  )}
                </Row>

                <Form.Group className="mb-3" style={{ marginTop: "18px" }}>
                  <Form.Label>Note:</Form.Label>
                  <Form.Control
                    type="text"
                    name="note"
                    value={newTransaction.note}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Row className="mb-3">
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Date:</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={newTransaction.date}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Recurring Transaction:</Form.Label>
                      <Form.Check
                        type="switch"
                        name="recurring"
                        checked={newTransaction.recurring}
                        onChange={handleInputChange}
                        style={{
                          transform: "scale(1.5)",
                          transformOrigin: "left",
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    className="btn btn-animate"
                    style={{
                      backgroundColor: "#A5BB9F",
                      color: "black",
                      border: "none",
                    }}
                  >
                    Add
                  </Button>
                </div>
              </Form>
            </Card>
          </div>
        )}

        {/* Transactions */}
        <Row>
          <h3>
            <strong>Your Transactions</strong>
          </h3>
          {Object.keys(groupedTransactions).length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <PaginatedTable
              groupedTransactions={groupedTransactions}
              groupedAllTransactions={groupedAllTransactions}
              handleRowClick={handleRowClick}
              profile={profile}
              itemsPerPage={15}
              selectedMonth={selectedMonth}
            />
          )}
        </Row>
        <Row className="mb-3">
          <Col className="d-flex justify-content-end">
            <Button
              className="btn btn-animate"
              style={{
                backgroundColor: "#A5BB9F",
                color: "black",
                border: "none",
              }}
              onClick={handleExport}
            >
              Export
            </Button>
          </Col>
        </Row>
        {/* Edit Transaction */}
        {selectedTransaction && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 9999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Card
              style={{
                position: "relative",
                backgroundColor: "#E9E9DF",
                padding: "20px",
                borderRadius: "8px",
                width: "90%",
                maxWidth: "800px",
              }}
            >
              <Button
                variant="link"
                onClick={() => setSelectedTransaction(null)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  fontSize: "1.5rem",
                  color: "black",
                  textDecoration: "none",
                }}
              >
                &times;
              </Button>
              <h3>Edit Transaction</h3>
              <Form onSubmit={handleSaveEdit}>
                <Form.Group className="mb-3">
                  <Form.Label>Category:</Form.Label>
                  <Form.Select
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
                  </Form.Select>
                </Form.Group>
                <Row className="mb-3 align-items-center">
                  <Col xs="auto">
                    <Form.Group>
                      <Form.Label>Amount:</Form.Label>
                      <Form.Control
                        type="number"
                        name="amount"
                        value={selectedTransaction.amount}
                        onChange={handleEditAmountChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col xs="auto" className="mx-2">
                    <Form.Group>
                      <Form.Label>Currency:</Form.Label>
                      <Form.Select
                        name="currency"
                        value={selectedCurrency}
                        onChange={handleEditCurrencyChange}
                      >
                        {profile && profile.currency ? (
                          <>
                            <option value={profile.currency}>
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
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  {convertedAmount !== null &&
                    selectedCurrency !== profile?.currency && (
                      <Col xs="auto">
                        <Form.Group>
                          <Form.Label>Converted Amount:</Form.Label>
                          <Form.Control
                            value={
                              convertedAmount !== null
                                ? convertedAmount.toFixed(2) +
                                  " " +
                                  profile?.currency
                                : ""
                            }
                            readOnly
                          />
                        </Form.Group>
                      </Col>
                    )}
                </Row>
                <Row className="mb-3 align-items-center">
                  <Col xs="auto">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowCustomRateField(!showCustomRateField);
                        if (showCustomRateField) {
                          setCustomExchangeRate("");
                          if (selectedTransaction.amount) {
                            convertAmount(
                              selectedCurrency,
                              selectedTransaction.amount
                            );
                          }
                        }
                      }}
                    >
                      {showCustomRateField
                        ? "Remove Custom Rate"
                        : "Set Custom Exchange Rate"}
                    </Button>
                  </Col>
                  {showCustomRateField && (
                    <Col xs={6}>
                      <Form.Group className="mb-0">
                        <Form.Label>Custom Exchange Rate:</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={customExchangeRate}
                          onChange={handleCustomRateChange}
                        />
                      </Form.Group>
                    </Col>
                  )}
                  <Col xs="auto">
                    <Button
                      type="button"
                      onClick={() => setShowCalculator(!showCalculator)}
                      variant="outline-secondary"
                    >
                      {showCalculator ? "Hide Calculator" : "Calculator"}
                    </Button>
                  </Col>

                  {showCalculator && (
                    <Col xs="auto">
                      <Calculator
                        onResult={(result) => {
                          setNewTransaction((prev) => ({
                            ...prev,
                            amount: result,
                          }));
                          setShowCalculator(false);
                        }}
                        onClose={() => setShowCalculator(false)}
                      />
                    </Col>
                  )}
                </Row>

                <Form.Group className="mb-3" style={{ marginTop: "18px" }}>
                  <Form.Label>Note:</Form.Label>
                  <Form.Control
                    type="text"
                    name="note"
                    value={selectedTransaction.note}
                    onChange={handleEditChange}
                  />
                </Form.Group>
                <Row className="mb-3">
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Date:</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={selectedTransaction.date}
                        onChange={handleEditChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label>Recurring Transaction:</Form.Label>
                      <Form.Check
                        type="switch"
                        name="recurring"
                        checked={selectedTransaction.recurring}
                        onChange={handleEditChange}
                        style={{
                          transform: "scale(1.5)",
                          transformOrigin: "left",
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    className="btn btn-animate"
                    style={{
                      backgroundColor: "#A5BB9F",
                      color: "black",
                      border: "none",
                    }}
                  >
                    Save
                  </Button>
                  <Button variant="danger" onClick={handleDeleteTransaction}>
                    Delete
                  </Button>
                </div>
              </Form>
            </Card>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Transactions;
