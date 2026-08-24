const mongoose = require("mongoose");
const Order = require("../models/Order");
const nodemailer = require("nodemailer");




// ==========================================================
// WHATSAPP NOTIFICATION — READY FOR API
// ==========================================================

async function sendWhatsAppOrderMessage(order, status) {

    try {

        // ==================================================
        // WHATSAPP API ABHI CONFIGURED NAHI
        // ==================================================

        if (
            !process.env.WHATSAPP_API_URL ||
            !process.env.WHATSAPP_API_TOKEN
        ) {

            console.log(
                "WHATSAPP: API not configured — message skipped."
            );

            return false;
        }


        // ==================================================
        // CUSTOMER NUMBER
        // ==================================================

        const customerPhone =
            String(
                order?.phone ||
                order?.user?.phone ||
                ""
            )
            .trim();


        if (!customerPhone) {

            console.error(
                "WHATSAPP ERROR: Customer WhatsApp number missing."
            );

            return false;
        }


        // ==================================================
        // CUSTOMER NAME
        // ==================================================

        const customerName =
            order?.user?.name ||
            "Customer";


        // ==================================================
        // ORDER ID
        // ==================================================

        const orderId =
            String(order._id)
                .slice(-8)
                .toUpperCase();


        // ==================================================
        // ORDER TOTAL
        // ==================================================

        const total =
            Number(
                order.totalPrice || 0
            )
            .toLocaleString("en-PK");


        // ==================================================
        // VIEW ORDER LINK
        // ==================================================

        const frontendURL =
            process.env.FRONTEND_URL ||
            "http://127.0.0.1:5500";


        const orderURL =
            `${frontendURL}/orders.html`;


        // ==================================================
        // STATUS MESSAGE
        // ==================================================

        let statusMessage =
            "Your order status has been updated.";


        if (status === "Confirmed") {

            statusMessage =
                "Your order has been confirmed and is now being prepared by ZM LABEL.";

        }

        else if (status === "Shipped") {

            statusMessage =
                "Your order has been shipped and is now on its way to you.";

        }

        else if (status === "Delivered") {

            statusMessage =
                "Your order has been delivered successfully.";

        }

        else if (status === "Cancelled") {

            statusMessage =
                "Your ZM LABEL order has been cancelled.";

        }


        // ==================================================
        // WHATSAPP MESSAGE
        // ==================================================

        const message =

`*ZM LABEL*
Official Store

Hi ${customerName},

${statusMessage}

*Order:* #${orderId}
*Total:* Rs. ${total}

View your order:
${orderURL}

Thank you for shopping with *ZM LABEL*.

— ZM LABEL`;


        // ==================================================
        // API REQUEST
        // ==================================================

        const response =
            await fetch(
                process.env.WHATSAPP_API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${process.env.WHATSAPP_API_TOKEN}`

                    },

                    body:
                        JSON.stringify({

                            to:
                                customerPhone,

                            message:
                                message

                        })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            console.error(
                "WHATSAPP API ERROR:",
                result
            );

            return false;
        }


        console.log(
            "=========================================="
        );

        console.log(
            "WHATSAPP MESSAGE SENT"
        );

        console.log(
            "TO:",
            customerPhone
        );

        console.log(
            "STATUS:",
            status
        );

        console.log(
            "=========================================="
        );


        return true;

    }

    catch (error) {

        console.error(
            "SEND WHATSAPP ERROR:",
            error.message
        );

        return false;
    }

}

// ==========================================================
// EMAIL TRANSPORTER
// ==========================================================

let transporter = null;

function createEmailTransporter() {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn(
                "EMAIL_USER or EMAIL_PASS is missing in .env"
            );

            return null;
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "smtp.gmail.com",

            port: Number(
                process.env.EMAIL_PORT || 587
            ),

            secure:
                String(
                    process.env.EMAIL_SECURE || "false"
                ).toLowerCase() === "true",

            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

    } catch (error) {

        console.error(
            "EMAIL TRANSPORTER ERROR:",
            error.message
        );

        return null;
    }
}

transporter = createEmailTransporter();


// ==========================================================
// HTML ESCAPE
// ==========================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================================
// PRICE FORMAT
// ==========================================================

function formatPrice(value) {

    return Number(value || 0)
        .toLocaleString("en-PK");
}


// ==========================================================
// SEND ORDER STATUS EMAIL
// ==========================================================

async function sendOrderStatusEmail(order, status) {

    try {

        if (!transporter) {

            console.error(
                "EMAIL ERROR: Transporter not configured."
            );

            return false;
        }


        // ==================================================
        // CUSTOMER
        // ==================================================

        const customerEmail =
            order?.user?.email;

        const customerName =
            order?.user?.name ||
            order?.user?.username ||
            "Customer";


        if (!customerEmail) {

            console.error(
                "EMAIL ERROR: Customer email missing."
            );

            return false;
        }


        // ==================================================
        // ORDER ID
        // ==================================================

        const fullOrderId =
            String(order._id);

        const orderShortId =
            fullOrderId
                .slice(-8)
                .toUpperCase();


        // ==================================================
        // DATE
        // ==================================================

        const orderDate =
            order.createdAt
                ? new Date(order.createdAt)
                    .toLocaleDateString(
                        "en-PK",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    )
                : "N/A";


        // ==================================================
        // PAYMENT
        // ==================================================

        const paymentMethod =
            order.paymentMethod || "COD";

        const paymentStatus =
            order.paymentStatus || "Pending";


        // ==================================================
        // TRACKING
        // ==================================================

        const trackingNumber =
            String(
                order.trackingNumber || ""
            ).trim();

        const trackingUrl =
            String(
                order.trackingUrl || ""
            ).trim();


        // ==================================================
        // STATUS CONTENT
        // ==================================================

        let statusTitle =
            `Order ${status}`;

        let statusMessage =
            "Your order status has been updated.";


        if (status === "Confirmed") {

            statusTitle =
                "Your Order Is Confirmed";

            statusMessage =
                "Great news! Your order has been confirmed and is now being prepared by our team.";
        }

        else if (status === "Shipped") {

            statusTitle =
                "Your Order Has Shipped";

            statusMessage =
                "Great news! Your order is on its way. You can use the tracking information below to follow your shipment.";
        }

        else if (status === "Delivered") {

            statusTitle =
                "Your Order Has Been Delivered";

            statusMessage =
                "Your order has been successfully delivered. We hope you love your ZM LABEL purchase.";
        }

        else if (status === "Cancelled") {

            statusTitle =
                "Your Order Has Been Cancelled";

            statusMessage =
                "Your ZM LABEL order has been cancelled.";
        }


        // ==================================================
        // PRODUCTS
        // ==================================================

        const products =
            Array.isArray(order.products)
                ? order.products
                : [];


        let productsHTML =
            products
                .map(item => {

                    const product =
                        item?.product;


                    if (
                        !product ||
                        typeof product !== "object"
                    ) {
                        return "";
                    }


                    const productName =
                        product.name || "Product";

                    const brand =
                        product.brand || "ZM LABEL";

                    const quantity =
                        Number(item.quantity || 1);


                    const price =
                        Number(
                            item.price ??
                            product.price ??
                            0
                        );


                    const subtotal =
                        price * quantity;


                    const size =
                        item.size || "";

                    const color =
                        item.color || "";


                    // ==================================================
                    // IMAGE
                    // ==================================================

                    let imageURL = "";

                    if (product.image) {

                        const backendURL =
                            process.env.BACKEND_URL ||
                            "http://localhost:5000";

                        const imageValue =
                            String(product.image);

                        imageURL =
                            imageValue.startsWith("http")
                                ? imageValue
                                : `${backendURL}/uploads/${imageValue}`;
                    }


                    const imageHTML =
                        imageURL

                            ? `
                                <img
                                    src="${escapeHTML(imageURL)}"
                                    alt="${escapeHTML(productName)}"
                                    width="80"
                                    height="100"
                                    style="
                                        display:block;
                                        width:80px;
                                        height:100px;
                                        object-fit:cover;
                                        border-radius:6px;
                                        border:1px solid #e5e5e5;
                                    "
                                >
                            `

                            : `
                                <div
                                    style="
                                        width:80px;
                                        height:100px;
                                        background:#f4f4f4;
                                        border-radius:6px;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        color:#999999;
                                        font-size:18px;
                                        font-weight:bold;
                                    "
                                >
                                    ZM
                                </div>
                            `;


                    // ==================================================
                    // SIZE / COLOR
                    // ==================================================

                    let optionsHTML = "";

                    if (size) {

                        optionsHTML +=
                            `Size: ${escapeHTML(size)}`;
                    }


                    if (color) {

                        if (optionsHTML) {

                            optionsHTML +=
                                " &nbsp; • &nbsp; ";
                        }

                        optionsHTML +=
                            `Color: ${escapeHTML(color)}`;
                    }


                    // ==================================================
                    // PRODUCT ROW
                    // ==================================================

                    return `

                        <tr>

                            <td
                                style="
                                    padding:18px 10px 18px 0;
                                    width:90px;
                                    vertical-align:top;
                                    border-bottom:1px solid #eeeeee;
                                "
                            >
                                ${imageHTML}
                            </td>


                            <td
                                style="
                                    padding:18px 10px;
                                    vertical-align:top;
                                    border-bottom:1px solid #eeeeee;
                                "
                            >

                                <div
                                    style="
                                        font-size:10px;
                                        color:#999999;
                                        letter-spacing:1.5px;
                                        text-transform:uppercase;
                                        margin-bottom:6px;
                                    "
                                >
                                    ${escapeHTML(brand)}
                                </div>


                                <div
                                    style="
                                        font-size:15px;
                                        font-weight:600;
                                        line-height:1.4;
                                        color:#111111;
                                    "
                                >
                                    ${escapeHTML(productName)}
                                </div>


                                ${
                                    optionsHTML
                                        ? `
                                            <div
                                                style="
                                                    margin-top:7px;
                                                    font-size:12px;
                                                    color:#777777;
                                                "
                                            >
                                                ${optionsHTML}
                                            </div>
                                        `
                                        : ""
                                }


                                <div
                                    style="
                                        margin-top:7px;
                                        font-size:12px;
                                        color:#777777;
                                    "
                                >
                                    Quantity: ${quantity}
                                </div>

                            </td>


                            <td
                                align="right"
                                style="
                                    padding:18px 0 18px 10px;
                                    vertical-align:top;
                                    white-space:nowrap;
                                    border-bottom:1px solid #eeeeee;
                                "
                            >

                                <div
                                    style="
                                        font-size:12px;
                                        color:#888888;
                                        margin-bottom:5px;
                                    "
                                >
                                    Rs. ${formatPrice(price)}
                                </div>


                                <strong
                                    style="
                                        font-size:15px;
                                        color:#111111;
                                    "
                                >
                                    Rs. ${formatPrice(subtotal)}
                                </strong>

                            </td>

                        </tr>

                    `;
                })
                .join("");


        if (!productsHTML) {

            productsHTML = `

                <tr>

                    <td
                        colspan="3"
                        style="
                            padding:20px 0;
                            color:#777777;
                            font-size:13px;
                        "
                    >
                        Product information unavailable.
                    </td>

                </tr>

            `;
        }


        // ==========================================================
        // TRACKING HTML
        // ==========================================================

        let trackingHTML = "";


        if (
            trackingNumber ||
            trackingUrl
        ) {

            trackingHTML = `

                <div
                    style="
                        margin-top:25px;
                        padding:22px;
                        background:#fafafa;
                        border:1px solid #e7e7e7;
                        border-radius:8px;
                    "
                >

                    <div
                        style="
                            font-size:10px;
                            font-weight:700;
                            letter-spacing:1.6px;
                            color:#888888;
                            margin-bottom:14px;
                        "
                    >
                        SHIPPING & TRACKING
                    </div>


                    ${
                        trackingNumber
                            ? `
                                <div
                                    style="
                                        font-size:11px;
                                        color:#888888;
                                        margin-bottom:5px;
                                    "
                                >
                                    TRACKING ID
                                </div>

                                <div
                                    style="
                                        font-size:18px;
                                        font-weight:700;
                                        letter-spacing:1px;
                                        color:#111111;
                                    "
                                >
                                    ${escapeHTML(trackingNumber)}
                                </div>
                            `
                            : ""
                    }


                    ${
                        trackingUrl
                            ? `
                                <div style="margin-top:16px;">

                                    <a
                                        href="${escapeHTML(trackingUrl)}"
                                        target="_blank"
                                        style="
                                            display:inline-block;
                                            background:#111111;
                                            color:#ffffff;
                                            padding:12px 20px;
                                            border-radius:5px;
                                            text-decoration:none;
                                            font-size:11px;
                                            font-weight:700;
                                            letter-spacing:1px;
                                        "
                                    >
                                        TRACK YOUR ORDER
                                    </a>

                                </div>
                            `
                            : ""
                    }

                </div>

            `;
        }


        // ==========================================================
        // DELIVERY
        // ==========================================================

        const address =
            order.address || "N/A";

        const city =
            order.city || "N/A";

        const phone =
            order.phone || "N/A";


        // ==========================================================
        // TOTAL
        // ==========================================================

        const orderTotal =
            Number(order.totalPrice || 0);


        // ==========================================================
        // EMAIL HTML
        // ==========================================================

        const mailHTML = `

<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width,initial-scale=1.0"
>

<title>
ZM LABEL - ${escapeHTML(statusTitle)}
</title>

</head>


<body
    style="
        margin:0;
        padding:0;
        background:#f3f3f3;
        font-family:Arial,Helvetica,sans-serif;
        color:#111111;
    "
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background:#f3f3f3;
        padding:35px 12px;
    "
>

<tr>

<td align="center">


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        max-width:650px;
        background:#ffffff;
        border:1px solid #e5e5e5;
    "
>


<!-- HEADER -->

<tr>

<td
    align="center"
    style="
        background:#111111;
        padding:32px 20px;
    "
>

<div
    style="
        color:#ffffff;
        font-size:26px;
        font-weight:700;
        letter-spacing:5px;
    "
>
    ZM LABEL
</div>


<div
    style="
        margin-top:8px;
        color:#999999;
        font-size:9px;
        letter-spacing:3px;
    "
>
    OFFICIAL STORE
</div>

</td>

</tr>


<!-- CONTENT -->

<tr>

<td style="padding:38px 34px;">


<div
    style="
        font-size:10px;
        font-weight:700;
        letter-spacing:2px;
        color:#999999;
        margin-bottom:10px;
    "
>
    ORDER UPDATE
</div>


<h1
    style="
        margin:0;
        font-size:27px;
        line-height:1.3;
        color:#111111;
    "
>
    ${escapeHTML(statusTitle)}
</h1>


<p
    style="
        margin:18px 0 0;
        font-size:14px;
        line-height:1.7;
        color:#555555;
    "
>
    Hi ${escapeHTML(customerName)},
</p>


<p
    style="
        margin:7px 0 0;
        font-size:14px;
        line-height:1.7;
        color:#666666;
    "
>
    ${escapeHTML(statusMessage)}
</p>


<!-- ORDER INFO -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        margin-top:25px;
        background:#fafafa;
        border:1px solid #eeeeee;
    "
>

<tr>

<td
    width="50%"
    style="
        padding:17px;
        border-right:1px solid #eeeeee;
    "
>

<div
    style="
        font-size:9px;
        color:#999999;
        letter-spacing:1.4px;
        margin-bottom:6px;
    "
>
    ORDER NUMBER
</div>


<strong
    style="
        font-size:14px;
        color:#111111;
    "
>
    #${escapeHTML(orderShortId)}
</strong>

</td>


<td
    width="50%"
    style="padding:17px;"
>

<div
    style="
        font-size:9px;
        color:#999999;
        letter-spacing:1.4px;
        margin-bottom:6px;
    "
>
    ORDER DATE
</div>


<strong
    style="
        font-size:14px;
        color:#111111;
    "
>
    ${escapeHTML(orderDate)}
</strong>

</td>

</tr>

</table>


<!-- ITEMS -->

<div
    style="
        margin-top:32px;
        padding-bottom:12px;
        border-bottom:1px solid #111111;
    "
>

<span
    style="
        font-size:11px;
        font-weight:700;
        letter-spacing:1.6px;
    "
>
    YOUR ORDER
</span>

</div>


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
>

${productsHTML}

</table>


<!-- TOTAL -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="margin-top:8px;"
>

<tr>

<td
    align="right"
    style="
        padding:18px 0;
        border-bottom:1px solid #eeeeee;
    "
>

<span
    style="
        margin-right:18px;
        font-size:12px;
        color:#777777;
    "
>
    TOTAL
</span>


<strong
    style="
        font-size:21px;
        color:#111111;
    "
>
    Rs. ${formatPrice(orderTotal)}
</strong>

</td>

</tr>

</table>


<!-- PAYMENT -->

<div
    style="
        margin-top:22px;
        padding:20px;
        border:1px solid #eeeeee;
    "
>

<div
    style="
        font-size:10px;
        font-weight:700;
        letter-spacing:1.5px;
        color:#999999;
        margin-bottom:15px;
    "
>
    PAYMENT INFORMATION
</div>


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
>

<tr>

<td
    style="
        padding-bottom:9px;
        font-size:13px;
        color:#666666;
    "
>
    Payment Method
</td>


<td
    align="right"
    style="
        padding-bottom:9px;
        font-size:13px;
        font-weight:600;
        color:#111111;
    "
>
    ${escapeHTML(paymentMethod)}
</td>

</tr>


<tr>

<td
    style="
        font-size:13px;
        color:#666666;
    "
>
    Payment Status
</td>


<td
    align="right"
    style="
        font-size:13px;
        font-weight:600;
        color:#111111;
    "
>
    ${escapeHTML(paymentStatus)}
</td>

</tr>

</table>

</div>


<!-- DELIVERY -->

<div
    style="
        margin-top:18px;
        padding:20px;
        background:#fafafa;
        border:1px solid #eeeeee;
    "
>

<div
    style="
        font-size:10px;
        font-weight:700;
        letter-spacing:1.5px;
        color:#999999;
        margin-bottom:14px;
    "
>
    DELIVERY DETAILS
</div>


<div
    style="
        font-size:13px;
        line-height:1.8;
        color:#333333;
    "
>

<strong>Shipping Address</strong>

<br>

${escapeHTML(address)}

<br>

${escapeHTML(city)}

<br><br>

<strong>Phone</strong>

<br>

${escapeHTML(phone)}

</div>

</div>


<!-- TRACKING -->

${trackingHTML}


<!-- THANK YOU -->

<div
    style="
        margin-top:30px;
        padding-top:23px;
        border-top:1px solid #eeeeee;
    "
>

<p
    style="
        margin:0;
        font-size:13px;
        line-height:1.8;
        color:#777777;
    "
>
    Thank you for shopping with
    <strong style="color:#111111;">
        ZM LABEL
    </strong>.
    We truly appreciate your order.
</p>

</div>


</td>

</tr>


<!-- FOOTER -->

<tr>

<td
    align="center"
    style="
        padding:25px 20px;
        background:#111111;
    "
>

<div
    style="
        color:#ffffff;
        font-size:12px;
        font-weight:700;
        letter-spacing:2px;
    "
>
    ZM LABEL
</div>


<div
    style="
        margin-top:7px;
        color:#888888;
        font-size:10px;
    "
>
    Official Store
</div>


<div
    style="
        margin-top:12px;
        color:#666666;
        font-size:9px;
    "
>
    This is an automated order update.
</div>

</td>

</tr>


</table>

</td>

</tr>

</table>

</body>

</html>

`;


        // ==========================================================
        // SEND
        // ==========================================================

        const info =
            await transporter.sendMail({

                from:
                    process.env.EMAIL_FROM ||
                    `"ZM LABEL" <${process.env.EMAIL_USER}>`,

                to:
                    customerEmail,

                subject:
                    `ZM LABEL | ${statusTitle} #${orderShortId}`,

                html:
                    mailHTML
            });


        console.log(
            "=========================================="
        );

        console.log(
            "ORDER EMAIL SENT SUCCESSFULLY"
        );

        console.log(
            "TO:",
            customerEmail
        );

        console.log(
            "STATUS:",
            status
        );

        console.log(
            "MESSAGE ID:",
            info.messageId
        );

        console.log(
            "=========================================="
        );


        return true;

    } catch (error) {

        console.error(
            "SEND ORDER STATUS EMAIL ERROR:",
            error.message
        );

        return false;
    }
}


// ==========================================================
// ADMIN TEST ORDER MODE
// ==========================================================
// ==========================================================
// ADMIN TEST ORDER MODE
// LOCAL TESTING ONLY
// ==========================================================

exports.checkOrderTestMode = async (req, res) => {

    try {

        const testMode =
            String(
                process.env.ORDER_TEST_MODE || "false"
            ).toLowerCase() === "true";


        /*
         * Authenticated user must be admin.
         *
         * Support common role values:
         * admin / Admin / ADMIN
         */

        const userRole =
            String(
                req.user?.role || ""
            )
            .trim()
            .toLowerCase();


        const isAdmin =
            userRole === "admin";


        const isAdminTestOrder =
            testMode &&
            isAdmin;


        console.log(
            "ORDER TEST MODE:",
            {
                testMode,
                userRole,
                isAdmin,
                isAdminTestOrder
            }
        );


        return res.json({

            success: true,

            isAdminTestOrder

        });

    }
    catch (error) {

        console.error(
            "CHECK ORDER TEST MODE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            isAdminTestOrder: false

        });

    }

};
// ==========================================================
// CREATE ORDER
// ==========================================================

exports.createOrder = async (req, res) => {

    try {

        const {
            products,
            totalPrice,
            address,
            city,
            phone,
            paymentMethod
        } = req.body;


        // ==================================================
        // VALIDATION
        // ==================================================

        if (
            !Array.isArray(products) ||
            products.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Order products are required"

            });
        }


        if (
            totalPrice === undefined ||
            Number(totalPrice) <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order total"

            });
        }


        if (!address || !city || !phone) {

            return res.status(400).json({

                success: false,

                message:
                    "Delivery information is incomplete"

            });
        }


        const userId =
            req.user?._id ||
            req.user?.id;

             const loggedInUserEmail =
    String(
        req.user?.email || ""
    )
    .trim()
    .toLowerCase();


const adminTestEmail =
    String(
        process.env.ADMIN_TEST_EMAIL || ""
    )
    .trim()
    .toLowerCase();


const isAdminTestOrder =
    String(
        process.env.ORDER_TEST_MODE || "false"
    ).toLowerCase() === "true" &&
    adminTestEmail &&
    loggedInUserEmail === adminTestEmail;



        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "User not authenticated"

            });
        }


        // ==================================================
        // PAYMENT METHOD
        // ==================================================

        const allowedPaymentMethods = [

            "COD",
            "Easypaisa",
            "JazzCash",
            "Credit Card"

        ];


        const selectedPayment =
            paymentMethod || "COD";


        if (
            !allowedPaymentMethods.includes(
                selectedPayment
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment method"

            });
        }


        // ==================================================
        // PREPARE PRODUCTS
        // ==================================================

        const orderProducts =
            products.map(item => {

                const quantity =
                    Number(item.quantity || 1);

                const price =
                    Number(item.price ?? 0);


                return {

                    product:
                        item.product,

                    quantity:
                        quantity > 0
                            ? quantity
                            : 1,

                    size:
                        item.size
                            ? String(item.size)
                            : "",

                    color:
                        item.color
                            ? String(item.color)
                            : "",

                    price:
                        price >= 0
                            ? price
                            : 0

                };
            });


        // ==================================================
        // DELIVERY
        // ==================================================
const deliveryCharge =
    isAdminTestOrder
        ? 0
        : 300;

const deliveryChargeStatus =
    isAdminTestOrder
        ? "Paid"
        : "Pending"; 

        // ==================================================
        // ORDER STATUS
        // ==================================================

        const orderStatus =
            "Confirmed";


        const paymentStatus =
    isAdminTestOrder
        ? "Paid"
        : "Pending";


        // ==================================================
        // CREATE ORDER
        // ==================================================
const subtotalFromProducts =
    orderProducts.reduce(
        (total, item) => {

            return total +
                (
                    Number(item.price || 0) *
                    Number(item.quantity || 1)
                );

        },
        0
    );


const finalOrderTotal =
    subtotalFromProducts +
    deliveryCharge;


/* =========================================================
   CREATE ORDER
========================================================= */

const order =
    await Order.create({

        user:
            userId,

        products:
            orderProducts,

        totalPrice:
            finalOrderTotal,

        deliveryCharge:
            deliveryCharge,

        deliveryChargeStatus:
            deliveryChargeStatus,

        address:
            String(address).trim(),

        city:
            String(city).trim(),

        phone:
            String(phone).trim(),

        paymentMethod:
            selectedPayment,

        paymentStatus:
            paymentStatus,

        status:
            orderStatus,

        trackingNumber:
            "",

        trackingUrl:
            ""

    });
        // ==================================================
        // POPULATE
        // ==================================================

        const populatedOrder =
            await Order.findById(order._id)
                .populate("user")
                .populate("products.product");


        // ==================================================
        // CONFIRMED EMAIL
        // ==================================================

        await sendOrderStatusEmail(
            populatedOrder,
            "Confirmed"
        );


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(201).json({

            success: true,

            message:
                "Order Placed Successfully",

            order:
                populatedOrder

        });

    }

    catch (error) {

        console.error(
            "CREATE ORDER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message

        });
    }
};


// ==========================================================
// GET MY ORDERS
// ==========================================================

exports.getMyOrders = async (req, res) => {

    try {

        const userId =
            req.user?._id ||
            req.user?.id;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "User not authenticated"

            });
        }


        const orders =
            await Order.find({
                user: userId
            })
            .populate("products.product")
            .sort({
                createdAt: -1
            });


        return res.json({

            success: true,

            orders

        });

    }

    catch (error) {

        console.error(
            "GET MY ORDERS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message

        });
    }
};


// ==========================================================
// GET ALL ORDERS - ADMIN
// ==========================================================

exports.getAllOrders = async (req, res) => {

    try {

        const orders =
            await Order.find()
                .populate("user")
                .populate("products.product")
                .sort({
                    createdAt: -1
                });


        return res.json({

            success: true,

            orders

        });

    }

    catch (error) {

        console.error(
            "GET ALL ORDERS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message

        });
    }
};


// ==========================================================
// UPDATE ORDER STATUS - ADMIN
// ==========================================================

exports.updateOrderStatus = async (req, res) => {

    try {

        const { id } =
            req.params;


        const {
            status,
            trackingNumber,
            trackingUrl,
            products
        } = req.body;


        // ==================================================
        // VALIDATE ID
        // ==================================================

        if (!id) {

            return res.status(400).json({

                success: false,

                message:
                    "Order ID is required"

            });
        }


        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid Order ID"

            });
        }


        // ==================================================
        // FIND ORDER
        // ==================================================

        const order =
            await Order.findById(id);


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order Not Found"

            });
        }


        // ==================================================
        // ALLOWED STATUS
        // ==================================================

        const allowedStatuses = [

            "Pending",
            "Confirmed",
            "Shipped",
            "Delivered",
            "Cancelled"

        ];


        if (
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order status"

            });
        }


        // ==================================================
        // OLD STATUS
        // ==================================================

        const oldStatus =
            order.status || "Pending";


        // ==================================================
        // TRACKING
        // ==================================================

        const cleanTrackingNumber =
            String(
                trackingNumber !== undefined
                    ? trackingNumber
                    : order.trackingNumber || ""
            ).trim();


        const cleanTrackingUrl =
            String(
                trackingUrl !== undefined
                    ? trackingUrl
                    : order.trackingUrl || ""
            ).trim();


        // ==================================================
        // SHIPPED VALIDATION
        // ==================================================

        if (
            status === "Shipped" &&
            !cleanTrackingNumber &&
            !cleanTrackingUrl
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Tracking ID or Tracking URL is required when order is shipped"

            });
        }


        // ==================================================
        // UPDATE STATUS
        // ==================================================

        order.status =
            status;


        order.trackingNumber =
            cleanTrackingNumber;


        order.trackingUrl =
            cleanTrackingUrl;


        // ==================================================
        // UPDATE PRODUCTS
        // ==================================================

        if (Array.isArray(products)) {

            const oldProducts =
                Array.isArray(order.products)
                    ? order.products
                    : [];


            order.products =
                products.map((item, index) => {

                    const oldItem =
                        oldProducts[index];


                    const finalProduct =
                        item.product ||
                        oldItem?.product;


                    const finalQuantity =
                        Number(
                            item.quantity ??
                            oldItem?.quantity ??
                            1
                        );


                    const finalPrice =
                        Number(
                            item.price ??
                            oldItem?.price ??
                            0
                        );


                    return {

                        product:
                            finalProduct,

                        quantity:
                            finalQuantity > 0
                                ? finalQuantity
                                : 1,

                        price:
                            finalPrice >= 0
                                ? finalPrice
                                : 0,

                        size:
                            item.size !== undefined
                                ? String(item.size)
                                : String(
                                    oldItem?.size || ""
                                ),

                        color:
                            item.color !== undefined
                                ? String(item.color)
                                : String(
                                    oldItem?.color || ""
                                )

                    };

                });
        }


        // ==================================================
        // SAVE
        // ==================================================

        await order.save();


        // ==================================================
        // POPULATE UPDATED ORDER
        // ==================================================

        const updatedOrder =
            await Order.findById(order._id)
                .populate("user")
                .populate("products.product");


        // ==================================================
        // SEND STATUS EMAIL
        // ==================================================

        let emailSent = false;


        if (
            oldStatus !== status &&
            (
                status === "Confirmed" ||
                status === "Shipped" ||
                status === "Delivered" ||
                status === "Cancelled"
            )
        ) {

            emailSent =
                await sendOrderStatusEmail(
                    updatedOrder,
                    status
                );
        }


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.json({

            success: true,

            message:
                "Order Updated Successfully",

            emailSent,

            order:
                updatedOrder

        });

    }

    catch (error) {

        console.error(
            "UPDATE ORDER STATUS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message

        });
    }
};


// ==========================================================
// UPDATE PAYMENT STATUS - ADMIN
// ==========================================================

exports.updatePaymentStatus = async (req, res) => {

    try {

        const { id } =
            req.params;


        const { paymentStatus } =
            req.body;


        // ==================================================
        // VALIDATE ID
        // ==================================================

        if (!id) {

            return res.status(400).json({

                success: false,

                message:
                    "Order ID is required"

            });
        }


        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid Order ID"

            });
        }


        // ==================================================
        // FIND ORDER
        // ==================================================

        const order =
            await Order.findById(id);


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order Not Found"

            });
        }


        // ==================================================
        // VALIDATE PAYMENT STATUS
        // ==================================================

        const allowedPaymentStatuses = [

            "Pending",
            "Paid",
            "Failed"

        ];


        if (
            !allowedPaymentStatuses.includes(
                paymentStatus
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment status"

            });
        }


        // ==================================================
        // OLD PAYMENT STATUS
        // ==================================================

        const oldPaymentStatus =
            order.paymentStatus || "Pending";


        // ==================================================
        // UPDATE PAYMENT
        // ==================================================

        order.paymentStatus =
            paymentStatus;


        // ==================================================
        // AUTO CONFIRM
        // ==================================================

        if (
            paymentStatus === "Paid" &&
            order.status === "Pending"
        ) {

            order.status =
                "Confirmed";
        }


        // ==================================================
        // SAVE
        // ==================================================

        await order.save();


        // ==================================================
        // POPULATE
        // ==================================================

        const updatedOrder =
            await Order.findById(order._id)
                .populate("user")
                .populate("products.product");


        // ==================================================
        // EMAIL
        // ==================================================

        let emailSent = false;


        if (
            paymentStatus === "Paid" &&
            oldPaymentStatus !== "Paid" &&
            updatedOrder.status === "Confirmed"
        ) {

            emailSent =
                await sendOrderStatusEmail(
                    updatedOrder,
                    "Confirmed"
                );
        }


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.json({

            success: true,

            message:
                "Payment Status Updated Successfully",

            emailSent,

            order:
                updatedOrder

        });

    }

    catch (error) {

        console.error(
            "UPDATE PAYMENT STATUS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message

        });
    }
};