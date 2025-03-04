import React, { useState } from "react";
import { PieChart, Pie, Tooltip, Legend, Cell } from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AB47BC",
  "#FFA726",
  "#26C6DA",
  "#66BB6A",
];

function PieChartContainer({ data }) {
  const [selectedCategory, setSelectedCategory] = useState("expense"); //initially

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const filteredData = data.filter(
    (entry) => entry.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <div>
      {/* Dropdown */}
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="category-select">Select Category: </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="savings_investment">Savings & Investment</option>
        </select>
      </div>

      {/* Pie Chart */}
      <PieChart width={400} height={400}>
        <Pie
          data={filteredData}
          dataKey="total_amount"
          nameKey="subcategory"
          cx="50%"
          cy="50%"
          outerRadius={120}
          label
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}

export default PieChartContainer;
