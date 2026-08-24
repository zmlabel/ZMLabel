/* =========================================================
   ZM LABEL
   PAYMENT CONTROLLER

   DELIVERY ADVANCE PAYMENT SYSTEM

   FLOW:

   POST /api/payments/create
          ↓
   Payment session created

   POST /api/payments/verify
          ↓
   Payment verified
          ↓
   Frontend creates order

   TEST MODE:
   Can be enabled with:
   ZM_PAYMENT_TEST_MODE=true
========================================================= */

const crypto = require("crypto");

const Order = require("../models/Order");



/* =========================================================
   CONSTANTS
========================================================= */

const DELIVERY_ADVANCE = 300;



/* =========================================================
   CREATE PAYMENT
========================================================= */

exports.createPayment = async (req, res) => {

    try {

        const userId =
            req.user?._id ||
            req.user?.id ||
            req.userId;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."

            });

        }


        const {

            amount,

            paymentMethod

        } = req.body;


        /* =====================================================
           VALIDATE AMOUNT
        ===================================================== */

        if (
            Number(amount) !==
            DELIVERY_ADVANCE
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Delivery advance must be Rs.${DELIVERY_ADVANCE}.`

            });

        }


        /* =====================================================
           VALIDATE PAYMENT METHOD
        ===================================================== */

        const allowedMethods = [

            "COD",

            "Easypaisa",

            "JazzCash",

            "Credit Card"

        ];


        if (
            !allowedMethods.includes(
                paymentMethod
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment method."

            });

        }


        /* =====================================================
           PAYMENT ID
        ===================================================== */

        const paymentId =

            "ZM-" +
            Date.now() +
            "-" +
            crypto
                .randomBytes(4)
                .toString("hex")
                .toUpperCase();


        /* =====================================================
           TEST MODE
        ===================================================== */

        const testMode =
            process.env.ZM_PAYMENT_TEST_MODE ===
            "true";


        /*
         * IMPORTANT:
         *
         * Test mode only for localhost/development.
         */

        if (testMode) {

            return res.status(200).json({

                success: true,

                testMode: true,

                paymentId:

                    paymentId,

                transactionId:

                    "TEST-" +
                    Date.now(),

                reference:

                    paymentId,

                amount:

                    DELIVERY_ADVANCE,

                paymentMethod:

                    paymentMethod,

                status:

                    "Paid",

                message:

                    "Test payment created successfully."

            });

        }


        /* =====================================================
           REAL GATEWAY PLACEHOLDER
        ===================================================== */

        /*
         * Real Easypaisa / JazzCash / Card gateway
         * should be integrated here.
         *
         * Do NOT mark payment as Paid here.
         */

        return res.status(501).json({

            success: false,

            gatewayRequired: true,

            paymentId:

                paymentId,

            amount:

                DELIVERY_ADVANCE,

            paymentMethod:

                paymentMethod,

            message:

                "Payment gateway is not configured yet."

        });

    }

    catch (error) {

        console.error(
            "CREATE PAYMENT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create payment."

        });

    }

};



/* =========================================================
   VERIFY PAYMENT
========================================================= */

exports.verifyPayment = async (req, res) => {

    try {

        const userId =
            req.user?._id ||
            req.user?.id ||
            req.userId;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required."

            });

        }


        const {

            paymentId,

            transactionId,

            paymentMethod,

            amount

        } = req.body;


        /* =====================================================
           BASIC VALIDATION
        ===================================================== */

        if (!paymentId) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment ID is required."

            });

        }


        if (
            Number(amount) !==
            DELIVERY_ADVANCE
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment amount."

            });

        }


        const allowedMethods = [

            "COD",

            "Easypaisa",

            "JazzCash",

            "Credit Card"

        ];


        if (
            !allowedMethods.includes(
                paymentMethod
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment method."

            });

        }


        /* =====================================================
           TEST MODE
        ===================================================== */

        const testMode =
            process.env.ZM_PAYMENT_TEST_MODE ===
            "true";


        if (testMode) {

            return res.status(200).json({

                success: true,

                verified: true,

                payment: {

                    paymentId:

                        paymentId,

                    transactionId:

                        transactionId ||
                        "TEST-" +
                        Date.now(),

                    reference:

                        paymentId,

                    amount:

                        DELIVERY_ADVANCE,

                    paymentMethod:

                        paymentMethod,

                    status:

                        "Paid"

                },

                message:

                    "Test payment verified successfully."

            });

        }


        /* =====================================================
           REAL PAYMENT VERIFICATION
        ===================================================== */

        /*
         * Real gateway verification goes here.
         *
         * NEVER trust:
         *
         * req.body.status = "Paid"
         *
         * from frontend.
         *
         * Backend must verify directly with
         * Easypaisa/JazzCash/Card provider.
         */


        return res.status(501).json({

            success: false,

            verified: false,

            message:

                "Real payment verification is not configured."

        });

    }

    catch (error) {

        console.error(
            "VERIFY PAYMENT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            verified: false,

            message:
                "Payment verification failed."

        });

    }

};



/* =========================================================
   PAYMENT STATUS
========================================================= */

exports.getPaymentStatus = async (req, res) => {

    try {

        const paymentId =
            req.params.paymentId;


        if (!paymentId) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment ID is required."

            });

        }


        /*
         * For real gateway:
         *
         * Query gateway/provider here.
         */


        return res.status(200).json({

            success: true,

            paymentId:

                paymentId,

            status:

                "Pending",

            message:

                "Payment status lookup is ready."

        });

    }

    catch (error) {

        console.error(
            "PAYMENT STATUS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to get payment status."

        });

    }

};