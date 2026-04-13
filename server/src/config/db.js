const mongoose = require("mongoose");

let dbStatus = "disconnected";

const connectDB = async () => {
	const mongoUri = process.env.MONGO_URI;

	if (!mongoUri || mongoUri.includes("<") || mongoUri.includes(">")) {
		dbStatus = "invalid-config";
		throw new Error("MONGO_URI is not configured with a valid connection string");
	}

	dbStatus = "connecting";
	try {
		await mongoose.connect(mongoUri, {
			serverSelectionTimeoutMS: 5000,
		});
		dbStatus = "connected";
		console.log("MongoDB connected");
	} catch (error) {
		dbStatus = "disconnected";
		throw error;
	}
};

const getDbStatus = () => ({
	status: dbStatus,
	readyState: mongoose.connection.readyState,
});

module.exports = { connectDB, getDbStatus };
