/* =========================================================
   ZM LABEL
   PAYMENT ROUTES
========================================================= */

const express = require("express");

const router = express.Router();

const {
    protect
} = require("../middleware/authMiddleware");

const {
    createPayment,
    verifyPayment
} = require("../controllers/paymentController");


/* =========================================================
   CREATE PAYMENT
========================================================= */

router.post(
    "/create",
    protect,
    createPayment
);


/* =========================================================
   VERIFY PAYMENT
========================================================= */

router.post(
    "/verify",
    protect,
    verifyPayment
);


/* =========================================================
   EXPORT
========================================================= */

module.exports = router;