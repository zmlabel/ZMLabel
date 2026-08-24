const express = require("express");

const router = express.Router();


// ==========================================================
// MIDDLEWARE
// ==========================================================

const { protect } =
    require("../middleware/authMiddleware");

const { admin } =
    require("../middleware/adminMiddleware");


// ==========================================================
// CONTROLLER
// ==========================================================

const {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    updatePaymentStatus,
    checkOrderTestMode
} = require("../controllers/orderController");

// ==========================================================
// USER
// ==========================================================

// GET /api/orders/test-mode
router.get(
    "/test-mode",
    protect,
    checkOrderTestMode
);

// POST /api/orders
router.post(
    "/",
    protect,
    createOrder
);


// GET /api/orders/myorders
router.get(
    "/myorders",
    protect,
    getMyOrders
);


// ==========================================================
// ADMIN
// ==========================================================

// GET /api/orders
router.get(
    "/",
    protect,
    admin,
    getAllOrders
);


// PATCH /api/orders/:id/status
router.patch(
    "/:id/status",
    protect,
    admin,
    updateOrderStatus
);


// PATCH /api/orders/:id/payment
router.patch(
    "/:id/payment",
    protect,
    admin,
    updatePaymentStatus
);


module.exports = router;