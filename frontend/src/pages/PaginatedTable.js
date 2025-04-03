import React, { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import "../styles/table.css";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";

const getCategoryColor = (cat) => {
  if (cat === "expense") return "#78281f";
  else if (cat === "income") return "#196f3d";
  else return "#2e4053";
};

const flattenTransactions = (groupedTransactions = {}) => {
  let rows = [];
  const sortedDates = Object.keys(groupedTransactions).sort();
  sortedDates.forEach((date) => {
    rows.push({ type: "header", date });
    groupedTransactions[date].forEach((transaction) => {
      rows.push({ type: "transaction", transaction, date });
    });
  });
  return rows;
};

const filterTransactions = (groupedTransactions, filters) => {
  const filtered = {};
  Object.keys(groupedTransactions).forEach((date) => {
    if (filters.minDate || filters.maxDate) {
      const transactionDate = new Date(date);
      if (filters.minDate && transactionDate < new Date(filters.minDate))
        return;
      if (filters.maxDate && transactionDate > new Date(filters.maxDate))
        return;
    }
    const filteredTransactions = groupedTransactions[date].filter(
      (transaction) => {
        if (
          filters.subcategory &&
          transaction.subcategory.toLowerCase() !==
            filters.subcategory.toLowerCase()
        )
          return false;
        if (
          filters.category &&
          transaction.category.toLowerCase() !== filters.category.toLowerCase()
        )
          return false;
        if (
          filters.minAmount &&
          Number(transaction.amount) < Number(filters.minAmount)
        )
          return false;
        if (
          filters.maxAmount &&
          Number(transaction.amount) > Number(filters.maxAmount)
        )
          return false;
        return true;
      }
    );
    if (filteredTransactions.length > 0) {
      filtered[date] = filteredTransactions;
    }
  });
  return filtered;
};

const PaginatedTable = ({
  groupedTransactions,
  groupedAllTransactions,
  handleRowClick,
  profile,
  itemsPerPage = 10,
  selectedMonth,
}) => {
  const { CURRENCY_SYMBOLS } = useContext(AuthContext);

  const [filters, setFilters] = useState({
    subcategory: "",
    category: "",
    minAmount: "",
    maxAmount: "",
    minDate: "",
    maxDate: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  let futureRecurGroupedTransactions = {};
  const today = new Date();
  const currentMonthStr = today.toISOString().slice(0, 7);
  const allTransactions = Object.values(groupedAllTransactions).flat();
  allTransactions.forEach((transaction) => {
    if (transaction.recurring && transaction.nextOccur) {
      if (transaction.nextOccur.startsWith(currentMonthStr)) {
        const nextOccurDate = new Date(transaction.nextOccur);
        if (nextOccurDate <= today) return;
        if (!futureRecurGroupedTransactions[transaction.nextOccur]) {
          futureRecurGroupedTransactions[transaction.nextOccur] = [];
        }
        futureRecurGroupedTransactions[transaction.nextOccur].push(transaction);
      }
    }
  });
  const flattenedRowsRecur = flattenTransactions(
    futureRecurGroupedTransactions
  );

  const handleApplyFilters = () => {
    const filteredData = filterTransactions(groupedTransactions, filters);
    setAppliedFilters(filteredData);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      subcategory: "",
      category: "",
      minAmount: "",
      maxAmount: "",
      minDate: "",
      maxDate: "",
    });
    setAppliedFilters(null);
    setCurrentPage(1);
  };

  const dataToPaginate = appliedFilters ? appliedFilters : groupedTransactions;
  const flattenedRows = flattenTransactions(dataToPaginate);
  const totalPages = Math.ceil(flattenedRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRows = flattenedRows.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="container-fluid">
      {/* filter */}
      <Card
        style={{
          backgroundColor: "#E9E9DF",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <div className="row mb-2">
          <div className="col-md-3 mb-2">
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="form-select"
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="savings_investment">Savings/Investment</option>
            </select>
          </div>
          <div className="col-md-3 mb-2">
            <select
              value={filters.subcategory}
              onChange={(e) =>
                setFilters({ ...filters, subcategory: e.target.value })
              }
              className="form-select"
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
              <optgroup label="Investment/Savings">
                <option value="">Select Investment Category</option>
                <option value="stock">Stock</option>
                <option value="bond">Bond</option>
                <option value="crypto">Crypto</option>
                <option value="fund">Fund</option>
                <option value="real_estate">Real Estate</option>
                <option value="savings">Savings</option>
              </optgroup>
            </select>
          </div>
          <div className="col-md-3 mb-2">
            <input
              type="number"
              placeholder="Min Amount"
              value={filters.minAmount}
              onChange={(e) =>
                setFilters({ ...filters, minAmount: e.target.value })
              }
              className="form-control"
            />
          </div>
          <div className="col-md-3 mb-2">
            <input
              type="number"
              placeholder="Max Amount"
              value={filters.maxAmount}
              onChange={(e) =>
                setFilters({ ...filters, maxAmount: e.target.value })
              }
              className="form-control"
            />
          </div>
        </div>

        <div className="row align-items-end">
          <div className="col-md-3 mb-2">
            <label htmlFor="minDate" className="ms-2">
              From:{" "}
            </label>
            <input
              id="minDate"
              type="date"
              value={filters.minDate}
              onChange={(e) =>
                setFilters({ ...filters, minDate: e.target.value })
              }
              className="form-control"
            />
          </div>
          <div className="col-md-3 mb-2">
            <label htmlFor="maxDate" className="ms-2">
              Until:{" "}
            </label>
            <input
              id="maxDate"
              type="date"
              value={filters.maxDate}
              onChange={(e) =>
                setFilters({ ...filters, maxDate: e.target.value })
              }
              className="form-control"
            />
          </div>
          <div className="col-md-3 mb-2">
            <button
              onClick={handleApplyFilters}
              className="btn w-100"
              style={{
                backgroundColor: "#A5BB9F",
                color: "black",
                border: "none",
              }}
            >
              Search
            </button>
          </div>
          <div className="col-md-3 mb-2">
            <button
              onClick={handleResetFilters}
              className="btn btn-outline-secondary w-100"
            >
              Clear All
            </button>
          </div>
        </div>
      </Card>

      <div className="row justify-content-center" style={{ marginTop: "30px" }}>
        {/* Transactions */}
        <table
          className="table table-bordered table-hover"
          style={{ width: "80%" }}
        >
          <thead>
            <tr style={{ backgroundColor: "#D9C9B3" }}>
              <th style={{ width: "120px" }}>Date</th>
              <th style={{ width: "20%" }}>Category</th>
              <th style={{ width: "45%" }}>Note</th>
              <th style={{ width: "120px" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row) => {
              if (row.type === "header") {
                return (
                  <tr
                    key={`header-${row.date}`}
                    style={{ backgroundColor: "#E9E9DF", fontWeight: "bold" }}
                  >
                    <td colSpan="4">{row.date}</td>
                  </tr>
                );
              } else {
                const transaction = row.transaction;
                return (
                  <tr
                    key={transaction.id}
                    onClick={() => handleRowClick(transaction)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: transaction.recurring
                        ? "#E9E9DF"
                        : "inherit",
                    }}
                  >
                    <td></td>
                    <td
                      style={{ color: getCategoryColor(transaction.category) }}
                    >
                      {transaction.subcategory.replace("_", " ")}
                    </td>
                    <td>{transaction.note || ""}</td>
                    <td
                      style={{ color: getCategoryColor(transaction.category) }}
                    >
                      {transaction.category === "expense"
                        ? "-"
                        : transaction.category === "income"
                        ? "+"
                        : ""}
                      {transaction.amount % 1 === 0
                        ? transaction.amount
                        : Number(transaction.amount).toFixed(2)}{" "}
                      {profile ? CURRENCY_SYMBOLS[profile.currency] : ""}
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>

        <div className="d-flex justify-content-center mt-3 align-items-center">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-outline-secondary me-3"
          >
            &larr;
          </button>
          <span className="mx-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="btn btn-outline-secondary ms-3"
          >
            &rarr;
          </button>
        </div>
      </div>

      {/* recurring */}
      {selectedMonth === currentMonthStr && (
        <div className="my-4">
          <h3 className="mb-3">
            <strong>Upcoming Recurring Transactions:</strong>
          </h3>
          <div className="row justify-content-center">
            <table
              className="table table-bordered table-hover"
              style={{ width: "80%", backgroundColor: "#FBE29F" }}
            >
              <thead>
                <tr className="custom-header">
                  <th style={{ width: "120px" }}>Date</th>
                  <th style={{ width: "20%" }}>Category</th>
                  <th style={{ width: "45%" }}>Note</th>
                  <th style={{ width: "120px" }}>Amount</th>
                </tr>
              </thead>

              <tbody>
                {flattenedRowsRecur.map((row) => {
                  if (row.type === "header") {
                    return (
                      <tr
                        key={`header-${row.date}`}
                        className="bg-warning fw-bold"
                      >
                        <td colSpan="4">{row.date}</td>
                      </tr>
                    );
                  } else {
                    const transaction = row.transaction;
                    return (
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
                          {transaction.category === "expense"
                            ? "-"
                            : transaction.category === "income"
                            ? "+"
                            : ""}
                          {transaction.amount % 1 === 0
                            ? transaction.amount
                            : Number(transaction.amount).toFixed(2)}{" "}
                          {profile ? CURRENCY_SYMBOLS[profile.currency] : ""}
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginatedTable;
