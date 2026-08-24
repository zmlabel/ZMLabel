const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {

    getWishlist,

    toggleWishlist

} = require("../controllers/wishlistController");

/* ==========================================
GET USER WISHLIST
========================================== */

router.get(

    "/",

    protect,

    getWishlist

);

/* ==========================================
ADD / REMOVE WISHLIST
========================================== */

router.post(

    "/",

    protect,

    toggleWishlist

);

module.exports = router;