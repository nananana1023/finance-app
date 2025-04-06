import React, { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import "../styles/table.css";
import FilterCard from "./FilterCard";

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
        // If subcategory filter is provided as a non-empty array, check if transaction's subcategory is included.
        if (filters.subcategory && filters.subcategory.length > 0) {
          const transactionSubcat = transaction.subcategory.toLowerCase();
          const selectedSubcats = filters.subcategory.map((sub) =>
            sub.toLowerCase()
          );
          if (!selectedSubcats.includes(transactionSubcat)) {
            return false;
          }
        }
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
  const { CURRENCY_SYMBOLS, SUBCATEGORY_MAPPING } = useContext(AuthContext);

  const [filters, setFilters] = useState({
    subcategory: [],
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
      <FilterCard
        filters={filters}
        setFilters={setFilters}
        SUBCATEGORY_MAPPING={SUBCATEGORY_MAPPING}
        handleApplyFilters={handleApplyFilters}
        handleResetFilters={handleResetFilters}
      />

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
