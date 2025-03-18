import React, { useState } from "react";
import { PieChart, Pie, Tooltip, Legend, Cell } from "recharts";

const COLORS = [
  "#9BBFE0",
  "#E8A09A",
  "#FBE29F",
  "#C6D68F",
  "#F66D44",
  "#FEAE65",
  "#E6F69D",
  "#AADEA7",
  "#64C2A6",
  "#2D87BB",
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

      <PieChart width={400} height={400}>
        <Pie
          data={filteredData}
          dataKey="total_amount"
          nameKey="subcategory"
          cx="50%"
          cy="50%"
          outerRadius={120}
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{
            position: "absolute",
            top: "50%",
            left: "420px",
            transform: "translateY(-50%)",
            width: "150px",
          }}
          formatter={(value, entry) => {
            const { total_amount } = entry.payload;
            return `${value}: ${total_amount}`;
          }}
        />
      </PieChart>
    </div>
  );
}

export default PieChartContainer;
