import { useEffect, useState } from "react";
import { getTransactions, logout, addTransaction, updateTransaction, deleteTransaction } from "../api";
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

const [editingTransaction, setEditingTransaction] = useState(null);
const [categoryColors, setCategoryColors] = useState({});
const [trendColors, setTrendColors] = useState({
  income: "#10b981",
  expense: "#ef4444"
});

const handleEditing = (transaction) => {
  setEditingTransaction(transaction);
};

const handleColorChange = (category, color) => {
  setCategoryColors(prev => ({ ...prev, [category]: color }));
};

const handleTrendColorChange = (type, color) => {
  setTrendColors(prev => ({ ...prev, [type]: color }));
};

const handleformSubmit = async (transactionData) => {
  setIsLoading(true);
  setFeedback(null);
  
  try {
    let res;
    const isEditing = !!transactionData.id;
    
    if (isEditing) {
      // EDIT existing transaction
      res = await updateTransaction(transactionData.id, transactionData);
    } else {
      // ADD new transaction
      res = await addTransaction(transactionData);
    }

    const savedTransaction = res.data;

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

    setLastUpdatedId(savedTransaction.id);
    setEditingTransaction(null);
    // Clear feedback after 5 seconds
    setTimeout(() => setFeedback(null), 5000);

  } catch (err) {
    console.error(err);
    setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to save transaction' });
  } finally {
    setIsLoading(false);
  }
};



  const handleDelete = async (id) => {
    setFeedback(null);
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      setFeedback({ type: 'success', message: 'Transaction deleted successfully!' });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed to delete transaction' });
      setTimeout(() => setFeedback(null), 5000);
    }
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

  // Initialize category colors when categories change
  useEffect(() => {
    const categories = Object.keys(categoryTotals);
    setCategoryColors(prev => {
      const updated = { ...prev };
      categories.forEach(cat => {
        if (!updated[cat]) {
          // Generate random color if not set
          updated[cat] = "#" + ((1 << 24) * Math.random() | 0).toString(16);
        }
      });
      return updated;
    });
  }, [categoryTotals]);


  // Chart data
  const barData = {
    labels: ["Income", "Expense"],
    datasets: [{ 
      label: "Amount", 
      data: [incomeTotal, expenseTotal],
      backgroundColor: ["#10b981", "#ef4444"],
      borderColor: ["#059669", "#dc2626"],
      borderWidth: 1
    }],
  };

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map(cat => categoryColors[cat] || "#cccccc"),
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
      { 
        label: "Income", 
        data: dates.map(d => groupedByDate[d].income),
        borderColor: trendColors.income,
        backgroundColor: trendColors.income.replace(')', ', 0.1)').replace('rgb', 'rgba'),
        tension: 0.4
      },
      { 
        label: "Expense", 
        data: dates.map(d => groupedByDate[d].expense),
        borderColor: trendColors.expense,
        backgroundColor: trendColors.expense.replace(')', ', 0.1)').replace('rgb', 'rgba'),
        tension: 0.4
      },
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

      {/* Category Color Editor */}
      <h3>Category Colors</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {Object.keys(categoryTotals).map(category => (
          <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ flex: 1 }}>{category}</label>
            <input
              type="color"
              value={categoryColors[category] || "#cccccc"}
              onChange={(e) => handleColorChange(category, e.target.value)}
              style={{ width: '50px', height: '36px', cursor: 'pointer' }}
            />
          </div>
        ))}
      </div>

      <h3>Income vs Expense Trend</h3>
      <Line data={trendData} />

      {/* Trend Color Editor */}
      <h3>Trend Colors</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ flex: 1 }}>Income</label>
          <input
            type="color"
            value={trendColors.income}
            onChange={(e) => handleTrendColorChange('income', e.target.value)}
            style={{ width: '50px', height: '36px', cursor: 'pointer' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ flex: 1 }}>Expense</label>
          <input
            type="color"
            value={trendColors.expense}
            onChange={(e) => handleTrendColorChange('expense', e.target.value)}
            style={{ width: '50px', height: '36px', cursor: 'pointer' }}
          />
        </div>
      </div>
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
        <button onClick={() => handleEditing(t)}>Edit</button>
        <button onClick={() => handleDelete(t.id)}>Delete</button>
      </li>
    ))}
  </ul>
</div>




  </div>
</div>


  );
  
}
