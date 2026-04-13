const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const erpRoutes = require("./routes/erpRoutes");
const { getDbStatus } = require("./config/db");

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? ["https://erp-xn3q.onrender.com", "https://real-erp.vercel.app"] 
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json());

app.get("/health", (req, res) => {
	res.json({
		status: "ok",
		database: getDbStatus(),
	});
});

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/erp", erpRoutes);
app.use("/api/erp", erpRoutes);

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ message: err.message || "Server error" });
});

module.exports = app;