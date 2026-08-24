const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
    getCart,
    addToCart,
    removeCartItem,
    updateQuantity,
    clearCart
} = require("../controllers/cartController");


/* ==========================================
GET USER CART
========================================== */

router.get(
    "/",
    protect,
    getCart
);


/* ==========================================
ADD PRODUCT TO CART
========================================== */

router.post(
    "/add",
    protect,
    addToCart
);


/* ==========================================
CLEAR CART
========================================== */

router.delete(
    "/clear",
    protect,
    clearCart
);


/* ==========================================
REMOVE ITEM
========================================== */

router.delete(
    "/:productId",
    protect,
    removeCartItem
);


/* ==========================================
UPDATE QUANTITY
========================================== */

router.put(
    "/:productId",
    protect,
    updateQuantity
);


module.exports = router;