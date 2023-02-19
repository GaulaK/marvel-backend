const express = require("express");
const router = express.Router();

// Packages
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

// Models
const User = require("../models/User");

// Middlewares
const isAuthenticated = require("../middlewares/isAuthenticated");

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
    // Verify Password
    const hash = SHA256(password + UserTryToConnect.salt).toString(encBase64);
    if (hash === UserTryToConnect.hash) {
      return res.json({
        _id: UserTryToConnect._id,
        token: UserTryToConnect.token,
        account: { username: UserTryToConnect.account.username },
        favorites: UserTryToConnect.favorites,
      });
    } else {
      return res.status(400).json({
        error: { message: `Connection Failed : Wrong email or password` },
      });
    }
  } catch (error) {
    return res.status(401).json({ error: { message: error.message } });
  }
});

router.post("/user/favorites/add", isAuthenticated, async (req, res) => {
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
      UserToModify.favorites[tabToModify].push(value);
      await UserToModify.save();
      return res.json({
        account: UserToModify.account,
        favorites: UserToModify.favorites,
      });
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  } else {
    return res.status(400).json({ error: "No data sent" });
  }
});
router.post("/user/favorites/remove", isAuthenticated, async (req, res) => {
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

      const indexToDelete = UserToModify.favorites[tabToModify].indexOf(
        UserToModify.favorites[tabToModify].find(
          (element) => element._id === value._id
        )
      );

      UserToModify.favorites[tabToModify].splice(indexToDelete, 1);
      await UserToModify.save();
      return res.json({
        account: UserToModify.account,
        favorites: UserToModify.favorites,
      });
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  } else {
    return res.status(400).json({ error: "No data sent" });
  }
});

router.get("/user/favorites/get", isAuthenticated, async (req, res) => {
  try {
    const UserGetFavorites = req.user;

    /*
     * Favorites are saved with all the content (because comics cannot be searched by their id*),
     * so we can return the raw data of 'Favorite' object without missing any data
     *
     * * we don't only save the title of comics because there is lot of issues with special characters encoding
     * Strength : Less API calls
     * Weakness: the API loses some interest, it would be better to stock all datas in the DB linked to the server
     *
     */
    res.json(UserGetFavorites.favorites);
  } catch (error) {
    console.log(error.response.data);
    console.log(error.message);
  }
});

module.exports = router;
