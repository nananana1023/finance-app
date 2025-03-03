import React, { createContext, useState } from "react";

const MonthContext = createContext();

//share the selected month in trans and home
export const MonthProvider = ({ children }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  });

  return (
    <MonthContext.Provider value={{ selectedMonth, setSelectedMonth }}>
      {children}
    </MonthContext.Provider>
  );
};

export default MonthContext;
