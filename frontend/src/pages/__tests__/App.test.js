// import { render, screen } from "@testing-library/react";
// import Login from "../Login";
// import Register from "../Register";
// import PieChart from "../PieChart";

// test("renders Login form", () => {
//   render(<Login />);
//   expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
// });

// test("renders Register form", () => {
//   render(<Register />);
//   expect(screen.getByText(/sign up/i)).toBeInTheDocument();
// });

// test("renders PieChart title", () => {
//   render(<PieChart data={[]} type="expense" />);
//   expect(screen.getByText(/category breakdown/i)).toBeInTheDocument();
// });

import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: () => <div>Route</div>,
}));

test("renders without crashing", () => {
  render(<App />);
  expect(screen.getByText(/login/i)).toBeInTheDocument(); // or any text that appears early
});
