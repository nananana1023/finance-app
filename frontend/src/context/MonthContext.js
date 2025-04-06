import React, { createContext, useState } from "react";

const MonthContext = createContext();

export const MonthProvider = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  });

  const formatMonth = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  };

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split("-");
    const currentDate = new Date(parseInt(year), parseInt(month) - 1);
    currentDate.setMonth(currentDate.getMonth() - 1);
    setSelectedMonth(formatMonth(currentDate));
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split("-");
    const currentDate = new Date(parseInt(year), parseInt(month) - 1);
    currentDate.setMonth(currentDate.getMonth() + 1);
    setSelectedMonth(formatMonth(currentDate));
  };

  return (
    <MonthContext.Provider
      value={{
        selectedMonth,
        setSelectedMonth,
        handleNextMonth,
        handlePrevMonth,
        formatMonth,
      }}
    >
      {children}
    </MonthContext.Provider>
  );
};

export default MonthContext;
