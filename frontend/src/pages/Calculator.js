import React, { useState } from "react";
import { evaluate } from "mathjs";

const Calculator = ({ onResult, onClose }) => {
  const [display, setDisplay] = useState("");

  const handleButtonClick = (value) => {
    if (value === "C") {
      setDisplay("");
    } else if (value === "=") {
      try {
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
    <div className="card mt-2" style={{ width: "300px", height: "300px" }}>
      <div className="card-body d-flex flex-column justify-content-between">
        <div className="mb-2">
          <input
            type="text"
            value={display}
            readOnly
            className="form-control text-end"
          />
        </div>
        <div className="d-flex flex-wrap">
          {buttons.map((btn) => (
            <button
              key={btn}
              type="button"
              onClick={() => handleButtonClick(btn)}
              className="btn m-1"
              style={{
                flex: "1 0 21%",
                padding: "10px",
                backgroundColor: "#D9C9B3",
                borderColor: "#D9C9B3",
              }}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
