const Coupon = require("../models/Coupon");


/* =========================================================
   CREATE COUPON
========================================================= */

const createCoupon = async (req, res) => {

    try {

        const {
            code,
            discountType,
            discountValue,
            minimumOrder,
            expiryDate,
            usageLimit,
            perCustomerLimit,
            active
        } = req.body;


        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Coupon code is required."
            });
        }


        if (!discountValue || Number(discountValue) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid discount value is required."
            });
        }


        if (
            discountType === "percentage" &&
            Number(discountValue) > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Percentage discount cannot exceed 100%."
            });
        }


        const normalizedCode =
            String(code).trim().toUpperCase();


        const existing =
            await Coupon.findOne({
                code: normalizedCode
            });


        if (existing) {

            return res.status(400).json({
                success: false,
                message: "Coupon code already exists."
            });

        }


        const coupon =
            await Coupon.create({

                code: normalizedCode,

                discountType:
                    discountType || "percentage",

                discountValue:
                    Number(discountValue),

                minimumOrder:
                    Number(minimumOrder || 0),

                expiryDate:
                    expiryDate
                        ? new Date(expiryDate)
                        : null,

                usageLimit:
                    Number(usageLimit || 0),

                perCustomerLimit:
                    Number(perCustomerLimit || 0),

                active:
                    active !== false

            });


        res.status(201).json({

            success: true,

            message: "Coupon created successfully.",

            coupon

        });

    }

    catch (error) {

        console.error(
            "CREATE COUPON ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to create coupon."

        });

    }

};


/* =========================================================
   GET ALL COUPONS
========================================================= */

const getCoupons = async (req, res) => {

    try {

        const coupons =
            await Coupon.find()
                .sort({
                    createdAt: -1
                });


        res.json({

            success: true,

            coupons

        });

    }

    catch (error) {

        console.error(
            "GET COUPONS ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load coupons."

        });

    }

};


/* =========================================================
   GET SINGLE COUPON
========================================================= */

const getCoupon = async (req, res) => {

    try {

        const coupon =
            await Coupon.findById(
                req.params.id
            );


        if (!coupon) {

            return res.status(404).json({

                success: false,

                message:
                    "Coupon not found."

            });

        }


        res.json({

            success: true,

            coupon

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message:
                "Failed to load coupon."

        });

    }

};


/* =========================================================
   VALIDATE COUPON
========================================================= */

const validateCoupon = async (req, res) => {

    try {

        const {
            code,
            subtotal
        } = req.body;


        if (!code) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a coupon code."

            });

        }


        const orderSubtotal =
            Number(subtotal || 0);


        const normalizedCode =
            String(code)
                .trim()
                .toUpperCase();


        const coupon =
            await Coupon.findOne({
                code: normalizedCode
            });


        if (!coupon) {

            return res.status(404).json({

                success: false,

                message:
                    "Invalid coupon code."

            });

        }


        /* ACTIVE */

        if (!coupon.active) {

            return res.status(400).json({

                success: false,

                message:
                    "This coupon is currently inactive."

            });

        }


        /* EXPIRY */

        if (
            coupon.expiryDate &&
            new Date() > coupon.expiryDate
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This coupon has expired."

            });

        }


        /* USAGE LIMIT */

        if (
            coupon.usageLimit > 0 &&
            coupon.usedCount >= coupon.usageLimit
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This coupon has reached its usage limit."

            });

        }


        /* MINIMUM ORDER */

        if (
            orderSubtotal <
            coupon.minimumOrder
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Minimum order value is Rs. ${coupon.minimumOrder.toLocaleString()}.`

            });

        }


        /* CALCULATE DISCOUNT */

        let discountAmount = 0;


        if (
            coupon.discountType ===
            "percentage"
        ) {

            discountAmount =
                Math.round(
                    orderSubtotal *
                    coupon.discountValue /
                    100
                );

        }

        else {

            discountAmount =
                coupon.discountValue;

        }


        /* NEVER EXCEED SUBTOTAL */

        discountAmount =
            Math.min(
                discountAmount,
                orderSubtotal
            );


        const discountedSubtotal =
            orderSubtotal -
            discountAmount;


        res.json({

            success: true,

            message:
                "Coupon applied successfully.",

            coupon: {

                id:
                    coupon._id,

                code:
                    coupon.code,

                discountType:
                    coupon.discountType,

                discountValue:
                    coupon.discountValue

            },

            discountAmount,

            subtotal:
                orderSubtotal,

            discountedSubtotal

        });

    }

    catch (error) {

        console.error(
            "VALIDATE COUPON ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to validate coupon."

        });

    }

};


/* =========================================================
   UPDATE COUPON
========================================================= */

const updateCoupon = async (req, res) => {

    try {

        const coupon =
            await Coupon.findById(
                req.params.id
            );


        if (!coupon) {

            return res.status(404).json({

                success: false,

                message:
                    "Coupon not found."

            });

        }


        const data =
            req.body;


        if (data.code) {

            data.code =
                String(data.code)
                    .trim()
                    .toUpperCase();

        }


        if (
            data.discountValue !== undefined
        ) {

            data.discountValue =
                Number(
                    data.discountValue
                );

        }


        if (
            data.minimumOrder !== undefined
        ) {

            data.minimumOrder =
                Number(
                    data.minimumOrder
                );

        }


        if (
            data.usageLimit !== undefined
        ) {

            data.usageLimit =
                Number(
                    data.usageLimit
                );

        }


        if (
            data.perCustomerLimit !== undefined
        ) {

            data.perCustomerLimit =
                Number(
                    data.perCustomerLimit
                );

        }


        const updatedCoupon =
            await Coupon.findByIdAndUpdate(

                req.params.id,

                data,

                {
                    new: true,
                    runValidators: true
                }

            );


        res.json({

            success: true,

            message:
                "Coupon updated successfully.",

            coupon:
                updatedCoupon

        });

    }

    catch (error) {

        console.error(
            "UPDATE COUPON ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to update coupon."

        });

    }

};


/* =========================================================
   TOGGLE ACTIVE
========================================================= */

const toggleCoupon =
    async (req, res) => {

        try {

            const coupon =
                await Coupon.findById(
                    req.params.id
                );


            if (!coupon) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Coupon not found."

                });

            }


            coupon.active =
                !coupon.active;


            await coupon.save();


            res.json({

                success: true,

                message:
                    coupon.active
                        ? "Coupon activated."
                        : "Coupon deactivated.",

                coupon

            });

        }

        catch (error) {

            console.error(
                "TOGGLE COUPON ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to update coupon."

            });

        }

    };


/* =========================================================
   DELETE COUPON
========================================================= */

const deleteCoupon = async (req, res) => {

    try {

        const coupon =
            await Coupon.findByIdAndDelete(
                req.params.id
            );


        if (!coupon) {

            return res.status(404).json({

                success: false,

                message:
                    "Coupon not found."

            });

        }


        res.json({

            success: true,

            message:
                "Coupon deleted successfully."

        });

    }

    catch (error) {

        console.error(
            "DELETE COUPON ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to delete coupon."

        });

    }

};


module.exports = {

    createCoupon,
    getCoupons,
    getCoupon,
    validateCoupon,
    updateCoupon,
    toggleCoupon,
    deleteCoupon

};