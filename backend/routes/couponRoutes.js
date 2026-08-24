const express = require("express");

const router = express.Router();

const {
    createCoupon,
    getCoupons,
    getCoupon,
    validateCoupon,
    updateCoupon,
    toggleCoupon,
    deleteCoupon
} = require("../controllers/couponController");

const {
    protect
} = require("../middleware/authMiddleware");

const {
    admin
} = require("../middleware/adminMiddleware");


/* =========================================================
   ADMIN
========================================================= */

router.post(
    "/",
    protect,
    admin,
    createCoupon
);


router.get(
    "/",
    protect,
    admin,
    getCoupons
);


router.get(
    "/:id",
    protect,
    admin,
    getCoupon
);


router.put(
    "/:id",
    protect,
    admin,
    updateCoupon
);


router.patch(
    "/:id/toggle",
    protect,
    admin,
    toggleCoupon
);


router.delete(
    "/:id",
    protect,
    admin,
    deleteCoupon
);


/* =========================================================
   CUSTOMER
========================================================= */

router.post(
    "/validate",
    protect,
    validateCoupon
);


module.exports = router;