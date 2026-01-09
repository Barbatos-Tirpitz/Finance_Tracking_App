import { useEffect, useState } from "react";
import { getTransactions, logout, addTransaction, updateTransaction } from "../api";
import TransactionForm from "./TransactionForm";
import { Bar, Pie, Line } from "react-chartjs-2";
import "../utils/chartSetup";
import "../styles/Dashboard.css";


export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [lastUpdatedId, setLastUpdatedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message }

  const load = async () => {
    const res = await getTransactions();
    setTransactions(res.data);
  };

  useEffect(() => {
    load();
  }, []);

const[editingTransaction, setEditingTransaction] = useState(null);

const handleEditing = (transaction) => {
  setEditingTransaction(transaction);
};

const handleformSubmit = async (transactionData) => {
  setIsLoading(true);
  setFeedback(null);
  
  try {
    let res;
    const isEditing = !!transactionData.id;
    
    if (isEditing) {
      // EDIT existing transaction
      res = await fetch(`http://localhost:5000/api/transaction/${transactionData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
        credentials: "include" // send session cookie
      });
    } else {
      // ADD new transaction
      res = await fetch("http://localhost:5000/api/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
        credentials: "include" // send session cookie
      });
    }

    const savedTransaction = await res.json();

    if (!res.ok) {
      setFeedback({ type: 'error', message: savedTransaction.error || "Error saving transaction" });
      setIsLoading(false);
      return;
    }

    // Update local state
    if (isEditing) {
      setTransactions(prev =>
        prev.map(t => (t.id === savedTransaction.id ? savedTransaction : t))
      );
      setFeedback({ type: 'success', message: 'Transaction updated successfully!' });
    } else {
      setTransactions(prev => [...prev, savedTransaction]);
      setFeedback({ type: 'success', message: 'Transaction added successfully!' });
    }

    setEditingTransaction(null);
    // Clear feedback after 5 seconds
    setTimeout(() => setFeedback(null), 5000);

  } catch (err) {
    console.error(err);
    setFeedback({ type: 'error', message: 'Failed to save transaction' });
  } finally {
    setIsLoading(false);
  }
};



  const handleDelete = (id) => {
  // delete transaction from state / API
  setTransactions(prev => prev.filter(t => t.id !== id));
};


  
  const handleLogout = async () => {
  await logout();
  window.location.reload();
};

  // Filter transactions by selected month/year
  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  // Totals
  const incomeTotal = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const expenseTotal = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = incomeTotal - expenseTotal;

  // Expense by category
  const categoryTotals = {};
  filteredTransactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      categoryTotals[t.category] =
        (categoryTotals[t.category] || 0) + Number(t.amount);
    });


  // Chart data
  const barData = {
    labels: ["Income", "Expense"],
    datasets: [{ label: "Amount", data: [incomeTotal, expenseTotal] }],
  };

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map(
          cat => "#"+((1<<24)*Math.random()|0).toString(16) // simple random colors
        ),
      },
    ],
  };

  // Trend line
  const groupedByDate = {};
  filteredTransactions.forEach(t => {
    const day = t.date;
    if (!groupedByDate[day]) groupedByDate[day] = { income: 0, expense: 0 };
    groupedByDate[day][t.type] += Number(t.amount);
  });

  const dates = Object.keys(groupedByDate).sort();
  const trendData = {
    labels: dates,
    datasets: [
      { label: "Income", data: dates.map(d => groupedByDate[d].income) },
      { label: "Expense", data: dates.map(d => groupedByDate[d].expense) },
    ],
  };

  
  return (
     <div className="dashboard-container">
  <button onClick={handleLogout}>Logout</button>
  <h2>Dashboard</h2>

  <div className="dashboard-grid">

    {/* GRID 1: Summary */}
    <div className="dashboard-card grid-1">
      <h3>Summary</h3>
      <p>Income: ₱{incomeTotal}</p>
      <p>Expenses: ₱{expenseTotal}</p>
      <strong>Balance: ₱{balance}</strong>
    </div>

    {/* GRID 2: Filters */}
    <div className="dashboard-card grid-2">
      <h3>Filters</h3>

      <label>Month: </label>
      <select
        value={selectedMonth}
        onChange={e => setSelectedMonth(Number(e.target.value))}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <option key={i} value={i}>
            {new Date(0, i).toLocaleString("default", { month: "long" })}
          </option>
        ))}
      </select>

      <label> Year: </label>
      <select
        value={selectedYear}
        onChange={e => setSelectedYear(Number(e.target.value))}
      >
        {[2023, 2024, 2025].map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>

    {/* GRID 3: Charts */}
    <div className="dashboard-card grid-3">
      <h3>Income vs Expense</h3>
      <Bar data={barData} />

      <h3>Expenses by Category</h3>
      <Pie data={pieData} />

      <h3>Income vs Expense Trend</h3>
      <Line data={trendData} />
    </div>

     {/*  GRID 4: Transactions */}
<div className="dashboard-card grid-4">
  <h3>{editingTransaction ? "Edit Transaction" : "Add Transaction"}</h3>
  
  {/* Feedback Messages */}
  {feedback && (
    <div className={`feedback feedback-${feedback.type}`}>
      {feedback.type === 'success' ? '✓' : '✕'} {feedback.message}
    </div>
  )}
  
  <TransactionForm
    initialData={editingTransaction}
    disabled={isLoading}
    onSubmit={handleformSubmit}
  />
  
  {isLoading && <div className="loading-spinner">Saving...</div>}

  <h3>Transactions</h3>
  <ul>
    {filteredTransactions.map(t => (
      <li
        key={t.id}
        className={`${t.type} ${t.id === lastUpdatedId ? "updated" : ""}`}
      >
        {t.date} | {t.category} | {t.type} | ₱{t.amount}
        <button onClick={() => setEditingTransaction(t)}>Edit</button>
        <button onClick={() => handleDelete(t.id)}>Delete</button>
      </li>
    ))}
  </ul>
</div>




  </div>
</div>


  );
  
}
