const express = require("express");

const router = express.Router();

const {
    aiChat
} = require("../controllers/aiController");

const {
    protect
} = require("../middleware/authMiddleware");


// ==========================================================
// ZM AI CHAT
// LOGIN REQUIRED
// ==========================================================

router.post(
    "/chat",
    protect,
    aiChat
);


module.exports = router;