require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Mongoose settings
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URI);

// Express settings
const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use(require("./routes/characters"));
app.use(require("./routes/comics"));
app.use(require("./routes/user"));

app.get("/", (req, res) => {
  res.json({
    message:
      "Welcome on Marvel Server. Author @GaulaK. See Documentation on GitHub : https://github.com/GaulaK/marvel-backend",
  });
});

app.all("*", (req, res) => {
  res.status(404).json({ error: { message: "404 - Page Not Found" } });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Marvel Server has started - 🕷️");
});
