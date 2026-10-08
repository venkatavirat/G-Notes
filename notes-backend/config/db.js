const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gnotes";

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        if (
            MONGO_URI === "mongodb://127.0.0.1:27017/gnotes"
            && (error.code === "ECONNREFUSED" || error.message.includes("ECONNREFUSED"))
        ) {
            console.error("Could not connect to local MongoDB on port 27017. Start the MongoDB service and try again.");
        }
        process.exit(1);
    }
};

module.exports = connectDB;