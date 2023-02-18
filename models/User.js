const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: String,
  account: {
    username: String,
  },
  favorites: {
    comics: Array,
    characters: Array,
  },
  token: String,
  hash: String,
  salt: String,
});

module.exports = User;
