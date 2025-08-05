const express = require("express");
const router = express.Router();

const { detectIntent } = require("../controllers/intentController");

router.post("/intent", detectIntent);


module.exports = router;
