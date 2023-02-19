const mongoose = require("mongoose");

/**
 * Model User for the DB
 *
 * Contains all informations of account : email, username, password tools
 *
 * favorites field is an object who contains two Array:
 * - comics : stocks all comics pinned by the user
 * - characters: stocks all characters pinned by the user
 */
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
