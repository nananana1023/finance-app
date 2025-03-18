import React, { useState, useContext } from "react";
import MonthContext from "../context/MonthContext";
import AuthContext from "../context/AuthContext";

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
        ) {
          return false;
        }
        if (
          filters.category &&
          transaction.category.toLowerCase() !== filters.category.toLowerCase()
        ) {
          return false;
        }
        if (
          filters.minAmount &&
          Number(transaction.amount) < Number(filters.minAmount)
        ) {
          return false;
        }
        if (
          filters.maxAmount &&
          Number(transaction.amount) > Number(filters.maxAmount)
        ) {
          return false;
        }
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
  handleRowClick,
  itemsPerPage = 10,
  profile,
  type,
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

  //pagination pages
  const [currentPage, setCurrentPage] = useState(1);

  // filter and pagination for only trans table
  const showFilters = type === "trans";

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

  //upcoming recurring trans this month
  if (type === "recur") {
    let futureRecurGroupedTransactions = {};
    const today = new Date();
    const currentMonthStr = today.toISOString().slice(0, 7);

    const allTransactions = Object.values(groupedTransactions).flat();
    allTransactions.forEach((transaction) => {
      if (transaction.recurring && transaction.nextOccur) {
        if (transaction.nextOccur.startsWith(currentMonthStr)) {
          const nextOccurDate = new Date(transaction.nextOccur);
          if (nextOccurDate <= today) return;
          if (!futureRecurGroupedTransactions[transaction.nextOccur]) {
            futureRecurGroupedTransactions[transaction.nextOccur] = [];
          }
          futureRecurGroupedTransactions[transaction.nextOccur].push(
            transaction
          );
        }
      }
    });
    const flattenedRows = flattenTransactions(futureRecurGroupedTransactions);
    return (
      <div>
        <h3>Upcoming Recurring Transactions:</h3>
        <table border="1" style={{ backgroundColor: "#FBE29F" }}>
          <thead>
            <tr>
              <th width="120">Date</th>
              <th>Category</th>
              <th>Note</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {flattenedRows.map((row) => {
              if (row.type === "header") {
                return (
                  <tr
                    key={`header-${row.date}`}
                    style={{ backgroundColor: "#FBE29F", fontWeight: "bold" }}
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
      </div>
    );
  } else {
    const dataToPaginate = appliedFilters
      ? appliedFilters
      : groupedTransactions;
    const flattenedRows = flattenTransactions(dataToPaginate);
    const totalPages = Math.ceil(flattenedRows.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentRows = flattenedRows.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    return (
      <div>
        {showFilters && (
          <div style={{ marginBottom: "20px" }}>
            <div>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                style={{ marginRight: "10px" }}
              >
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="savings">Savings</option>
              </select>
              <select
                value={filters.subcategory}
                onChange={(e) =>
                  setFilters({ ...filters, subcategory: e.target.value })
                }
                style={{ marginRight: "10px" }}
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
            <input
              type="number"
              placeholder="Min Amount"
              value={filters.minAmount}
              onChange={(e) =>
                setFilters({ ...filters, minAmount: e.target.value })
              }
              style={{ marginRight: "10px" }}
            />
            <input
              type="number"
              placeholder="Max Amount"
              value={filters.maxAmount}
              onChange={(e) =>
                setFilters({ ...filters, maxAmount: e.target.value })
              }
              style={{ marginRight: "10px" }}
            />
            <input
              type="date"
              placeholder="Min Date"
              value={filters.minDate}
              onChange={(e) =>
                setFilters({ ...filters, minDate: e.target.value })
              }
              style={{ marginRight: "10px" }}
            />
            <input
              type="date"
              placeholder="Max Date"
              value={filters.maxDate}
              onChange={(e) =>
                setFilters({ ...filters, maxDate: e.target.value })
              }
              style={{ marginRight: "10px" }}
            />
            <button onClick={handleApplyFilters}>Apply Filters</button>
            <button onClick={handleResetFilters} style={{ marginLeft: "10px" }}>
              Reset Filters
            </button>
          </div>
        )}
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
            {currentRows.map((row) => {
              if (row.type === "header") {
                return (
                  <tr
                    key={`header-${row.date}`}
                    style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}
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
                        ? "#FBE29F"
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span style={{ margin: "0 10px" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    );
  }
};

export default PaginatedTable;
