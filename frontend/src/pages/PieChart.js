import React, { useState, useContext } from "react";
import { PieChart, Pie, Tooltip, Legend, Cell } from "recharts";
import { Container, Row, Col, Form } from "react-bootstrap";
import AuthContext from "../context/AuthContext";

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
  const [selectedCategory, setSelectedCategory] = useState("expense");
  const SUBCATEGORY_MAPPING = useContext(AuthContext);
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const filteredData = data.filter(
    (entry) => entry.category.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <Container className="my-4">
      {/* dropdown */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group controlId="category-select">
            <Form.Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              style={{ width: "230px" }}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="savings_investment">Savings & Investment</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <div
            style={{
              position: "relative",
              width: "400px",
              height: "400px",
              marginLeft: 0,
            }}
          >
            <PieChart width={500} height={400}>
              <Pie
                data={filteredData}
                dataKey="total_amount"
                nameKey="subcategory"
                cx="50%"
                cy="50%"
                outerRadius={120}
              >
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
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
                  left: "300px",
                  transform: "translateY(-50%)",
                  width: "250px",
                }}
                formatter={(value, entry) => {
                  const key =
                    typeof value === "string" ? value.toLowerCase().trim() : "";
                  const label =
                    SUBCATEGORY_MAPPING[key] ||
                    key
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ");
                  return `${label}: ${entry.payload.total_amount}`;
                }}
              />
            </PieChart>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default PieChartContainer;
