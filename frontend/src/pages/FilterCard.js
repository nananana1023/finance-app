import React, { useState } from "react";
import { Card } from "react-bootstrap";

const INCOME_SUBCATEGORIES = [
  "salary",
  "allowance",
  "investment_gain",
  "stipend",
  "sale_proceeds",
  "dividend",
  "other",
];
const EXPENSE_SUBCATEGORIES = [
  "grocery",
  "restaurant",
  "entertainment",
  "healthcare",
  "utility",
  "subscription",
  "gift",
  "self_care",
  "housing",
  "clothes",
  "miscellaneous",
];
const SAVINGS_INVESTMENT_SUBCATEGORIES = [
  "stock",
  "bond",
  "crypto",
  "fund",
  "real_estate",
  "savings",
];

const ALL_SUBCATEGORIES = [
  ...INCOME_SUBCATEGORIES,
  ...EXPENSE_SUBCATEGORIES,
  ...SAVINGS_INVESTMENT_SUBCATEGORIES,
];

const FilterCard = ({
  filters,
  setFilters,
  SUBCATEGORY_MAPPING,
  handleApplyFilters,
  handleResetFilters,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const availableSubcategories =
    filters.category && filters.category.toLowerCase() !== "all"
      ? filters.category.toLowerCase() === "income"
        ? INCOME_SUBCATEGORIES
        : filters.category.toLowerCase() === "expense"
        ? EXPENSE_SUBCATEGORIES
        : filters.category.toLowerCase() === "savings_investment"
        ? SAVINGS_INVESTMENT_SUBCATEGORIES
        : []
      : ALL_SUBCATEGORIES;

  const handleSubcategoryChange = (e, subcat) => {
    if (e.target.checked) {
      setFilters({ ...filters, subcategory: [...filters.subcategory, subcat] });
    } else {
      setFilters({
        ...filters,
        subcategory: filters.subcategory.filter((item) => item !== subcat),
      });
    }
  };

  return (
    <Card
      style={{
        backgroundColor: "#E9E9DF",
        padding: "20px",
        borderRadius: "8px",
      }}
    >
      <div className="row mb-2">
        {/* Category Dropdown */}
        <div className="col-md-3 mb-2">
          <select
            value={filters.category}
            onChange={(e) =>
              // Reset subcategory selections when category changes.
              setFilters({
                ...filters,
                category: e.target.value,
                subcategory: [],
              })
            }
            className="form-select"
            style={{
              backgroundColor: "#fff",
              border: "1px solid #ced4da",
            }}
          >
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="savings_investment">Savings/Investment</option>
          </select>
        </div>

        {/* Multi-Select Dropdown for Subcategories */}
        <div className="col-md-3 mb-2">
          <div className="position-relative">
            <button
              type="button"
              className="form-select w-100"
              style={{
                backgroundColor: "#fff",
                border: "1px solid #ced4da",
              }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              Select Categories
            </button>
            {dropdownOpen && (
              <ul
                className="dropdown-menu show w-100"
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {availableSubcategories.map((subcat) => (
                  <li key={subcat} className="px-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`checkbox-${subcat}`}
                        checked={filters.subcategory.includes(subcat)}
                        onChange={(e) => handleSubcategoryChange(e, subcat)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`checkbox-${subcat}`}
                      >
                        {SUBCATEGORY_MAPPING[subcat] || subcat}
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Min Amount */}
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

        {/* Max Amount */}
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
        {/* Date Range - From */}
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
        {/* Date Range - Until */}
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
        {/* Search Button */}
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
        {/* Clear All Button */}
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
  );
};

export default FilterCard;
