const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const { getDbStatus } = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
	res.json({
		status: "ok",
		database: getDbStatus(),
	});
});

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ message: err.message || "Server error" });
});

module.exports = app;