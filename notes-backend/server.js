require("dotenv").config();

const express = require("express");
const cors = require("cors");
const uploadRoute = require("./routes/upload");
const connectDB = require("./config/db");
const notesRoutes = require("./routes/notes.routes");

const app = express();
app.use(cors());
const PORT = 5000;
connectDB();

app.use(express.json());
app.use("/api/upload", uploadRoute);
app.get("/", (req, res) => {
    res.send("G-NOTES backend is running!");
});

app.use("/api/notes", notesRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});