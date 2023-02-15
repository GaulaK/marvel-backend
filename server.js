require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// routes
app.use(require("./routes/characters"));
app.use(require("./routes/comics"));

app.get("/", (req, res) => {
  res.json({
    message:
      "Welcome on Marvel API. Author @GaulaK. See Documentation on GitHub : https://github.com/GaulaK/marvel-backend",
  });
});

app.all("*", (req, res) => {
  res.status(404).json({ error: { message: "404 - Page Not Found" } });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Marvel Server has started - 🕷️");
});
