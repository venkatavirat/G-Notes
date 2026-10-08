require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const connectDB = require("./config/db");

// Must run before routes are imported.
require("./config/cloudinary");

const uploadRoute = require("./routes/upload");
const notesRoutes = require("./routes/notes.routes");
const authRoutes = require("./routes/auth.routes");
const analyticsRoutes = require("./routes/analytics.routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "G-NOTES backend is running" });
});

app.use("/api/upload", uploadRoute);
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  if (error.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({ error: error.message });
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: error.message });
  }

  res.status(500).json({ message: "Internal server error." });
});

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;