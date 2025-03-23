import React, { useState } from "react";
import { evaluate } from "mathjs";

const Calculator = ({ onResult, onClose }) => {
  const [display, setDisplay] = useState("");

  const handleButtonClick = (value) => {
    if (value === "C") {
      setDisplay("");
    } else if (value === "=") {
      try {
        // Using mathjs evaluate for safety; eval was used in your snippet, but let's keep it safer
        const result = evaluate(display);
        setDisplay(result.toString());
        onResult(result);
      } catch (e) {
        setDisplay("Error");
      }
    } else {
      setDisplay(display + value);
    }
  };

  // Note the explicit type="button" for each button
  const buttons = [
    "7",
    "8",
    "9",
    "/",
    "4",
    "5",
    "6",
    "*",
    "1",
    "2",
    "3",
    "-",
    "0",
    "C",
    "=",
    "+",
  ];

  return (
    <div
      style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}
    >
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          value={display}
          readOnly
          style={{ width: "100%", textAlign: "right" }}
        />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {buttons.map((btn) => (
          <button
            key={btn}
            type="button"
            onClick={() => handleButtonClick(btn)}
            style={{ flex: "1 0 21%", margin: "5px", padding: "10px" }}
          >
            {btn}
          </button>
        ))}
      </div>
      {/* The close button also needs type="button" so it doesn't submit the form */}
      <button type="button" onClick={onClose} style={{ marginTop: "10px" }}>
        Close Calculator
      </button>
    </div>
  );
};

export default Calculator;
