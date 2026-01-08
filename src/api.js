import axios from "axios";
const API = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
});

export const register = (data) => API.post("/register", data);
export const login = (data) => API.post("/login", data);
export const logout = () => API.post("/logout");
export const addTransaction = (data) => API.post("/transaction", data);
export const updateTransaction = (id, data) => API.put(`/transaction/${id}`, data);
export const getTransactions = () => API.get("/transactions");
export const getMe = () => API.get("/me");

export const requestPasswordReset = (email) =>
  API.post("/request-reset", { email });

export const resetPassword = (token, newPassword) =>
  API.post("/reset-password", { token, newPassword });



