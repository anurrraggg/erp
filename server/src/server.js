require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
	try {
		await connectDB();
	} catch (error) {
		console.error("Database connection failed:", error.message);
		if (process.env.ERP_MOCK_MODE !== "true") {
			console.error("Exiting. To start without DB, set ERP_MOCK_MODE=true");
			process.exit(1);
		}
		console.warn("Starting server without DB in mock mode.");
	}

	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
};

startServer();
