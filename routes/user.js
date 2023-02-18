const express = require("express");
const router = express.Router();

//packages
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
// Models
const User = require("../models/User");
// Middlewares
const isAuthenticated = require("../middlewares/isAuthenticated");
const { default: axios } = require("axios");

router.post("/user/signup", async (req, res) => {
  const { username, email, password } = req.body;
  // Manage Password
  const salt = uid2(32);
  const hash = SHA256(password + salt).toString(encBase64);
  const token = uid2(32);
  try {
    if (!username) {
      return res
        .status(400)
        .json({ error: { message: "Please send Username" } });
    } else if (!email || !password) {
      return res
        .status(400)
        .json({ error: { message: "Please send all informations" } });
    }
    const EmailAlreadyExist = await User.find({ email: email }, "email");
    // email not in DB
    if (EmailAlreadyExist.length > 0) {
      return res.status(409).json({ error: { message: "Email already Use" } });
    }

    // Create User
    const newUser = new User({
      email,
      account: {
        username,
      },
      favorites: {
        comics: [],
        characters: [],
      },
      token,
      hash,
      salt,
    });
    await newUser.save();

    res.json({
      _id: newUser._id,
      token: newUser.token,
      account: { username: newUser.account.username },
      favorites: newUser.favorites,
    });
  } catch (error) {
    return res.json(error.message);
  }
});

router.post("/user/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const UserTryToConnect = await User.findOne({ email: email }).populate(
      "favorites"
    );

    if (!UserTryToConnect) {
      return res.status(401).json({
        error: { message: `Connection Failed : Wrong email or password` },
      });
    }
    const hash = SHA256(password + UserTryToConnect.salt).toString(encBase64);
    if (hash === UserTryToConnect.hash) {
      return res.json({
        _id: UserTryToConnect._id,
        token: UserTryToConnect.token,
        account: { username: UserTryToConnect.account.username },
        favorites: UserTryToConnect.favorites,
      });
    } else {
      return res.json({
        error: { message: "Connection Failed : Wrong email or password" },
      });
    }
  } catch (error) {
    return res.status(401).json({ error: { message: error.message } });
  }
});

router.post("/user/favorites/add", isAuthenticated, async (req, res) => {
  console.log(req.user);
  const UserToModify = req.user;
  if (Object.keys(req.body)[0]) {
    const tabToModify = Object.keys(req.body)[0];
    const value = req.body[tabToModify];
    if (tabToModify !== "characters" && tabToModify !== "comics") {
      return res.status(400).json({
        error: "No valid data sent, should be a characters or comics field",
      });
    }
    try {
      //Verify if isnt already in favorite
      if (UserToModify.favorites[tabToModify].indexOf(value) === -1) {
        UserToModify.favorites[tabToModify].push(value);
        await UserToModify.save();
        return res.json(UserToModify);
      } else {
        res.status(400).json({ error: "This id was already in favorite" });
      }
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  } else {
    return res.status(400).json({ error: "No data sent" });
  }
});
router.post("/user/favorites/remove", isAuthenticated, async (req, res) => {
  console.log("user:", req.user);
  const UserToModify = req.user;
  if (Object.keys(req.body)[0]) {
    const tabToModify = Object.keys(req.body)[0];
    const value = req.body[tabToModify];
    if (tabToModify !== "characters" && tabToModify !== "comics") {
      return res.status(400).json({
        error: "No valid data sent, should be a characters or comics field",
      });
    }
    try {
      //Verify if is already in favorite
      if (UserToModify.favorites[tabToModify].indexOf(value) !== -1) {
        UserToModify.favorites[tabToModify].splice(
          UserToModify.favorites[tabToModify].indexOf(value),
          1
        );
        await UserToModify.save();
        return res.json(UserToModify);
      } else {
        res.status(400).json({ error: "This id wasnt in favorites" });
      }
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  } else {
    return res.status(400).json({ error: "No data sent" });
  }
});

router.get("/user/favorites/get", isAuthenticated, async (req, res) => {
  //   console.log("user:", req.user);
  const UserGetFavorites = req.user;

  const favorites = { characters: [], comics: [] };

  try {
    for (
      let index = 0;
      index < UserGetFavorites.favorites["characters"].length;
      index++
    ) {
      const id = UserGetFavorites.favorites["characters"][index];

      const response = await axios.get(
        `${process.env.MARVEL_API_URL}/character/${id}?apiKey=${process.env.MARVEL_API_KEY}`
      );

      favorites["characters"].push(response.data);
    }
    for (
      let index = 0;
      index < UserGetFavorites.favorites["comics"].length;
      index++
    ) {
      const id = UserGetFavorites.favorites["comics"][index];
      const response = await axios.get(
        `${process.env.MARVEL_API_URL}/comic/${id}?apiKey=${process.env.MARVEL_API_KEY}`
      );
      favorites["comics"].push(response.data);
    }
    console.log(favorites);
    res.json(favorites);
  } catch (error) {
    // console.log(error.response.data);
    // console.log(error.message);
  }
});

module.exports = router;
