const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const sendMail = require("../utils/sendMail");


// ======================================================
// GET ALL ORDERS
// GET /api/admin/orders
// ======================================================

router.get("/orders", async (req, res) => {

    try {

        const orders = await Order.find({})
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(orders);

    } catch (error) {

        console.error("ADMIN GET ORDERS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message
        });

    }

});


// ======================================================
// UPDATE ORDER STATUS
// PUT /api/admin/orders/:id/status
// ======================================================

router.put("/orders/:id/status", async (req, res) => {

    try {

        const {
            status,
            trackingNumber
        } = req.body;


        // ==========================================
        // ALLOWED STATUSES
        // ==========================================

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];


        if (!allowedStatuses.includes(status)) {

            return res.status(400).json({
                message: "Invalid order status"
            });

        }


        // ==========================================
        // FIND ORDER
        // ==========================================

        const order = await Order.findById(
            req.params.id
        ).populate(
            "user",
            "name email"
        );


        if (!order) {

            return res.status(404).json({
                message: "Order not found"
            });

        }


        // ==========================================
        // SAVE TRACKING NUMBER
        // ==========================================

        if (trackingNumber !== undefined) {

            order.trackingNumber =
                String(trackingNumber).trim();

        }


        // ==========================================
        // SHIPPED VALIDATION
        // ==========================================

        if (status === "Shipped") {

            if (
                !order.trackingNumber ||
                order.trackingNumber.trim() === ""
            ) {

                return res.status(400).json({

                    message:
                        "Tracking number is required before shipping the order."

                });

            }

        }


        // ==========================================
        // UPDATE STATUS
        // ==========================================

        order.status = status;

        await order.save();


        // ==========================================
        // CUSTOMER INFORMATION
        // ==========================================

        const customerEmail =
            order.user?.email;

        const customerName =
            order.user?.name || "Customer";


        const orderId =
            order._id.toString();


        // ==========================================
        // SHIPPED EMAIL
        // ==========================================

        if (
            status === "Shipped" &&
            customerEmail
        ) {

            const tracking =
                order.trackingNumber;


            // --------------------------------------
            // TRACKING LINK
            // --------------------------------------
            // Abhi courier URL nahi hai.
            // Baad mein TRACKING_BASE_URL set kar dena.

            const trackingLink =
                process.env.TRACKING_BASE_URL
                    ? `${process.env.TRACKING_BASE_URL}${encodeURIComponent(tracking)}`
                    : "#";


            const subject =
                `ZM LABEL - Order #${orderId} Shipped`;


            const html = `

                <!DOCTYPE html>

                <html>

                <head>

                    <meta charset="UTF-8">

                    <title>
                        Order Shipped
                    </title>

                </head>


                <body
                    style="
                        margin:0;
                        padding:0;
                        background:#f5f5f5;
                        font-family:Arial,Helvetica,sans-serif;
                    "
                >

                    <div
                        style="
                            max-width:600px;
                            margin:40px auto;
                            background:#ffffff;
                            padding:40px;
                        "
                    >

                        <h2
                            style="
                                margin-top:0;
                                color:#111111;
                            "
                        >
                            ZM LABEL
                        </h2>


                        <p>
                            Hi ${customerName},
                        </p>


                        <p>
                            Great news! Your ZM LABEL
                            order has been shipped.
                        </p>


                        <div
                            style="
                                background:#f7f7f7;
                                padding:20px;
                                margin:25px 0;
                            "
                        >

                            <p>
                                <strong>
                                    Order ID:
                                </strong>

                                #${orderId}
                            </p>


                            <p>
                                <strong>
                                    Tracking Number:
                                </strong>

                                ${tracking}
                            </p>

                        </div>


                        ${
                            process.env.TRACKING_BASE_URL
                            ?
                            `
                            <a
                                href="${trackingLink}"
                                target="_blank"
                                style="
                                    display:inline-block;
                                    background:#111111;
                                    color:#ffffff;
                                    text-decoration:none;
                                    padding:14px 24px;
                                    border-radius:4px;
                                "
                            >
                                Track Your Order
                            </a>
                            `
                            :
                            ""
                        }


                        <p
                            style="
                                margin-top:30px;
                                color:#666666;
                            "
                        >
                            Thank you for shopping
                            with ZM LABEL.
                        </p>


                        <p
                            style="
                                color:#666666;
                            "
                        >
                            Regards,<br>
                            ZM LABEL Team
                        </p>

                    </div>

                </body>

                </html>

            `;


            try {

                await sendMail(
                    customerEmail,
                    subject,
                    html
                );

                console.log(
                    `SHIPPED EMAIL SENT: ${customerEmail}`
                );

            } catch (mailError) {

                console.error(
                    "SHIPPED EMAIL ERROR:",
                    mailError
                );

            }

        }


        // ==========================================
        // DELIVERED EMAIL
        // ==========================================

        if (
            status === "Delivered" &&
            customerEmail
        ) {

            const subject =
                `ZM LABEL - Order #${orderId} Delivered`;


            const html = `

                <!DOCTYPE html>

                <html>

                <head>

                    <meta charset="UTF-8">

                    <title>
                        Order Delivered
                    </title>

                </head>


                <body
                    style="
                        margin:0;
                        padding:0;
                        background:#f5f5f5;
                        font-family:Arial,Helvetica,sans-serif;
                    "
                >

                    <div
                        style="
                            max-width:600px;
                            margin:40px auto;
                            background:#ffffff;
                            padding:40px;
                        "
                    >

                        <h2>
                            ZM LABEL
                        </h2>


                        <p>
                            Hi ${customerName},
                        </p>


                        <p>
                            Your ZM LABEL order
                            <strong>
                                #${orderId}
                            </strong>
                            has been successfully delivered.
                        </p>


                        <p>
                            We hope you love your purchase.
                        </p>


                        <p>
                            Thank you for shopping
                            with ZM LABEL and supporting
                            our brand.
                        </p>


                        <p
                            style="
                                margin-top:30px;
                                color:#666666;
                            "
                        >
                            Regards,<br>
                            ZM LABEL Team
                        </p>

                    </div>

                </body>

                </html>

            `;


            try {

                await sendMail(
                    customerEmail,
                    subject,
                    html
                );

                console.log(
                    `DELIVERED EMAIL SENT: ${customerEmail}`
                );

            } catch (mailError) {

                console.error(
                    "DELIVERED EMAIL ERROR:",
                    mailError
                );

            }

        }


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({

            success: true,

            message:
                `Order status updated to ${status}`,

            order

        });


    } catch (error) {

        console.error(
            "ADMIN UPDATE ORDER ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to update order status",

            error:
                error.message

        });

    }

});


module.exports = router;