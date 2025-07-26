import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  // Use useRef to keep category colors persistent across renders
  const categoryColorsRef = useRef({});

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const res = await axios.get("/api/expenses");
    setExpenses(res.data);
  };

  const addExpense = async () => {
    if (!amount || !category || amount <= 0) return;
    await axios.post("/api/expenses", { amount: Number(amount), category });
    setAmount("");
    setCategory("");
    fetchExpenses();
  };

  // Helper: generate random hex color
  const getRandomColor = () => {
    // Generate random color in hex format like #A1B2C3
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
  };

  // Group expenses by category
  const grouped = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  // Assign a color for each category, save in ref to keep stable colors
  Object.keys(grouped).forEach((cat) => {
    if (!categoryColorsRef.current[cat]) {
      categoryColorsRef.current[cat] = getRandomColor();
    }
  });

  // Extract colors for chart from the saved map
  const backgroundColor = Object.keys(grouped).map(
    (cat) => categoryColorsRef.current[cat]
  );

  const chartData = {
    labels: Object.keys(grouped),
    datasets: [
      {
        data: Object.values(grouped),
        backgroundColor,
        borderWidth: 1,
      },
    ],
  };

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        Expense Tracker
      </h2>

      <div
        style={{
          marginBottom: "1rem",
          padding: "1rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "0.25rem",
            }}
          >
            Amount:
          </label>
          <input
            type="number"
            min="0"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontWeight: "bold",
              marginBottom: "0.25rem",
            }}
          >
            Category:
          </label>
          <input
            type="text"
            placeholder="Enter category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          onClick={addExpense}
          style={{
            width: "100%",
            padding: "0.6rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Add Expense
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <strong>Total Expenses: </strong>${total.toFixed(2)}
      </div>

      <div style={{ maxWidth: 350, margin: "0 auto" }}>
        <Pie data={chartData} height={250} width={250} />
      </div>
    </div>
  );
}

export default App;
