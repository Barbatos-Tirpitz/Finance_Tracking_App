import { useState, useEffect } from "react";
import { addTransaction } from "../api";

  const TransactionForm = ({ refresh, initialData = null, onSubmit, disabled = false }) => {
    const [type, setType] = useState("expense");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");

    useEffect(() => {
      if (initialData) {
        setType(initialData.type);
        setCategory(initialData.category);
        setAmount(initialData.amount);
        setDate(initialData.date);
      } else {
        // Reset form when initialData is cleared (after successful save)
        setType("expense");
        setCategory("");
        setAmount("");
        setDate("");
      }

    }, [initialData]);

    const handleSubmit = e => {
      e.preventDefault();

      if (!category || !amount || !date) return;

      const transactionData = { type, category, amount, date, id:initialData?.id };
      onSubmit(transactionData);
      // Don't clear form here—let parent component handle it via initialData change
    };

  return (
    <form onSubmit={handleSubmit} className="data-entry-form">
      <label>Type</label>
      <select value={type} onChange={e => setType(e.target.value)} disabled={disabled}>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <label>Category</label>
      <input
        type="text"
        placeholder="Food, Rent, Salary..."
        value={category}
        onChange={e => setCategory(e.target.value)}
        disabled={disabled}
      />

      <label>Amount (₱)</label>
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        disabled={disabled}
      />

      <label>Date</label>
      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        disabled={disabled}
      />

      <button type="submit" disabled={disabled}>{initialData ? "Update" : "Add"} Transaction</button>
    </form>
  );
};

export default TransactionForm;