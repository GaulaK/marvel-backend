const express = require("express");
const router = express.Router();

const axios = require("axios");

/**
 * Gives a list of 100 Marvel characters
 */
// TODO: Search Character by name
router.get("/characters", async (req, res) => {
  try {
    const page = parseInt(req.query?.page) ? parseInt(req.query.page) : 1;

    const response = await axios.get(
      `${process.env.MARVEL_API_URL}/characters?apiKey=${
        process.env.MARVEL_API_KEY
      }&skip=${(page - 1) * 100}`
    );
    // console.log(response.data);

    res.json({ data: response.data });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
    console.log(error);
  }
});

/**
 * Gives all informations about 1 character
 */
router.get("/character/:characterId", async (req, res) => {
  try {
    const { characterId } = req.params;
    if (!characterId) {
      res.status(400).json({
        error: { message: "Need a not undefined ID for the character" },
      });
    } else {
      const response = await axios.get(
        `${process.env.MARVEL_API_URL}/character/${characterId}?apiKey=${process.env.MARVEL_API_KEY}`
      );
      if (!response.data) {
        res
          .status(404)
          .json({ error: { message: "No Character Found with this ID" } });
      } else {
        res.json({ data: response.data });
      }
    }
  } catch (error) {
    res.status(400).json({ error: { message: "Invalid Request Sent" } });
    console.log(error);
  }
});

module.exports = router;
