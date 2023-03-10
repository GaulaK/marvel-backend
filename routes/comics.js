const express = require("express");
const router = express.Router();

const axios = require("axios");

/**
 * Gives a list of 100 Marvel comics
 */

router.get("/comics", async (req, res) => {
  try {
    // set search value, default value is empty string (same as no filter)
    const search = req.query?.search ? req.query.search : "";
    const page = parseInt(req.query?.page) ? parseInt(req.query.page) : 1;

    const response = await axios.get(
      `${process.env.MARVEL_API_URL}/comics?apiKey=${
        process.env.MARVEL_API_KEY
      }&skip=${(page - 1) * 100}&title=${search}`
    );

    res.json({ data: response.data });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

/**
 * Gives all informations about 1 character
 */
router.get("/comics/:characterId", async (req, res) => {
  try {
    const { characterId } = req.params;
    if (!characterId) {
      res.status(400).json({
        error: { message: "Need a not undefined ID for the character" },
      });
    } else {
      const response = await axios.get(
        `${process.env.MARVEL_API_URL}/comics/${characterId}?apiKey=${process.env.MARVEL_API_KEY}`
      );
      if (!response.data) {
        res.status(404).json({
          error: {
            message: `No Comics Found for the character ${characterId}`,
          },
        });
      } else {
        res.json({ data: response.data });
      }
    }
  } catch (error) {
    res.status(400).json({ error: { message: "Invalid Request Sent" } });
  }
});

module.exports = router;
