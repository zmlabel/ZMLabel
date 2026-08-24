/* =========================================================
   ZM LABEL
   PAYMENT.JS

   DELIVERY ADVANCE PAYMENT FLOW

   FLOW:

   checkout.html
        ↓
   pendingCheckoutOrder
        ↓
   payment.html
        ↓
   select payment method
        ↓
   payment processing
        ↓
   payment verification / gateway
        ↓
   create order
        ↓
   clear cart / buy now
        ↓
   order-success.html
========================================================= */


/* =========================================================
   API CONFIG
========================================================= */

const PAYMENT_ORDER_API =
    (window.ZM_API_BASE || "").replace(/\/$/, "") +
    "/api/orders";


const PAYMENT_CART_API =
    (window.ZM_API_BASE || "http://localhost:5000").replace(/\/$/, "") +
    "/api/cart";


/*
 * Real payment gateway endpoint.
 *
 * Keep this endpoint ready for your backend.
 *
 * Example:
 *
 * POST /api/payments/create
 *
 * For now this is intentionally NOT called
 * automatically because real Easypaisa,
 * JazzCash and card payments require
 * merchant credentials + server verification.
 */

const PAYMENT_GATEWAY_API =
    (window.ZM_API_BASE || "").replace(/\/$/, "") +
    "/api/payments";



/* =========================================================
   CONSTANTS
========================================================= */

const DELIVERY_ADVANCE =
    300;


const PENDING_ORDER_KEY =
    "pendingCheckoutOrder";


const BUY_NOW_KEY =
    "buyNowProduct";


const APPLIED_COUPON_KEY =
    "checkoutAppliedCoupon";



/* =========================================================
   STATE
========================================================= */

let pendingCheckout =
    null;


let selectedPaymentMethod =
    "";


let isProcessing =
    false;



/* =========================================================
   TOKEN
========================================================= */

function getToken() {

    return localStorage.getItem("token");

}



/* =========================================================
   API REQUEST HELPER
========================================================= */

async function paymentApiRequest(
    url,
    options = {}
) {

    const token =
        getToken();


    const headers = {

        ...(options.headers || {})

    };


    if (
        options.body &&
        !headers["Content-Type"]
    ) {

        headers["Content-Type"] =
            "application/json";

    }


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    const response =
        await fetch(
            url,
            {
                ...options,
                headers
            }
        );


    let data = null;


    try {

        data =
            await response.json();

    }

    catch {

        data = {};

    }


    if (!response.ok) {

        throw new Error(

            data.message ||
            data.error ||
            `Request failed: ${response.status}`

        );

    }


    return data;

}



/* =========================================================
   CHECK LOGIN
========================================================= */

function checkPaymentLogin() {

    const token =
        getToken();


    if (!token) {

        window.location.href =
            "login.html";

        return false;

    }


    return true;

}



/* =========================================================
   LOAD PENDING ORDER
========================================================= */

function loadPendingCheckout() {

    try {

        const raw =
            localStorage.getItem(
                PENDING_ORDER_KEY
            );


        if (!raw) {

            return null;

        }


        const parsed =
            JSON.parse(raw);


        if (
            !parsed ||
            !parsed.order
        ) {

            return null;

        }


        return parsed;

    }

    catch (error) {

        console.error(
            "Pending Checkout Error:",
            error
        );


        return null;

    }

}



/* =========================================================
   VALIDATE PENDING ORDER
========================================================= */

function validatePendingCheckout(data) {

    if (
        !data ||
        !data.order
    ) {

        return false;

    }


    const order =
        data.order;


    if (
        !Array.isArray(
            order.products
        ) ||
        order.products.length === 0
    ) {

        return false;

    }


    if (
        !order.customer ||
        !order.customer.fullName
    ) {

        return false;

    }


    if (!order.phone) {

        return false;

    }


    if (!order.address) {

        return false;

    }


    if (!order.city) {

        return false;

    }


    return true;

}



/* =========================================================
   FORMAT MONEY
========================================================= */

function money(
    value
) {

    return (
        "Rs. " +
        Number(
            value || 0
        ).toLocaleString()
    );

}



/* =========================================================
   PAYMENT IMAGE URL
   SAFE PRODUCT IMAGE HANDLER
========================================================= */

function getPaymentImage(item) {

    /*
     * Product image can come from:
     *
     * item.image
     * item.images[0]
     * item.product.image
     * item.product.images[0]
     */

    let image = "";

    if (item) {

        image =
            item.image ||
            item.images?.[0] ||
            item.product?.image ||
            item.product?.images?.[0] ||
            "";

    }


    image = String(image || "").trim();


    /*
     * NO IMAGE
     *
     * IMPORTANT:
     * Don't use placeholder.jpg here.
     * Otherwise missing placeholder creates
     * infinite onerror requests.
     */

    if (!image) {

        return "";

    }


    /*
     * Already complete URL
     */

    if (
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("data:image/")
    ) {

        return image;

    }


    const base =
        (
            window.ZM_API_BASE ||
            "http://localhost:5000"
        ).replace(/\/+$/, "");


    /*
     * /uploads/product.jpg
     */

    if (
        image.startsWith("/uploads/")
    ) {

        return base + image;

    }


    /*
     * uploads/product.jpg
     */

    if (
        image.startsWith("uploads/")
    ) {

        return base + "/" + image;

    }


    /*
     * /product.jpg
     *
     * If backend has already returned
     * a root-relative path.
     */

    if (
        image.startsWith("/")
    ) {

        return base + image;

    }


    /*
     * Normal filename:
     *
     * abc.jpg
     *
     * => http://localhost:5000/uploads/abc.jpg
     */

    return `${base}/uploads/${image}`;

}

/* =========================================================
   RENDER PAYMENT ITEMS
========================================================= */

function renderPaymentItems() {

    const container =
        document.getElementById(
            "paymentItems"
        );


    if (!container) {

        return;

    }


    const order =
        pendingCheckout?.order;


    if (
        !order ||
        !Array.isArray(order.products) ||
        order.products.length === 0
    ) {

        container.innerHTML = `

            <div class="loading">
                No order items found.
            </div>

        `;

        return;

    }


    container.innerHTML = "";


    order.products.forEach(
        (item, index) => {

            const quantity =
                Math.max(
                    1,
                    Number(
                        item.quantity || 1
                    )
                );


            const price =
                Number(
                    item.price || 0
                );


            const total =
                price * quantity;


            const name =
                item.name ||
                item.product?.name ||
                "ZM LABEL Product";


            const image =
                getPaymentImage(item);


            const variantParts = [];


            if (item.size) {

                variantParts.push(
                    `Size: ${item.size}`
                );

            }


            if (item.color) {

                variantParts.push(
                    `Color: ${item.color}`
                );

            }


            const variants =
                variantParts.join(" • ");


            /*
             * IMAGE HTML
             *
             * If actual image exists:
             * show actual product image.
             *
             * If no image exists:
             * show a simple icon instead of
             * requesting missing placeholder.jpg.
             */

            let imageHTML = "";


            if (image) {

                imageHTML = `

                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(name)}"
                        class="payment-product-img"
                        data-index="${index}"
                    >

                `;

            }

            else {

                imageHTML = `

                    <div class="payment-no-image">

                        <i class="ri-image-line"></i>

                    </div>

                `;

            }


            container.innerHTML += `

                <div class="payment-item">

                    <div class="payment-item-image">

                        ${imageHTML}

                        <span class="payment-item-qty">
                            ${quantity}
                        </span>

                    </div>


                    <div class="payment-item-info">

                        <h3>
                            ${escapeHTML(name)}
                        </h3>


                        ${
                            variants
                                ? `
                                    <p>
                                        ${escapeHTML(variants)}
                                    </p>
                                  `
                                : ""
                        }


                        <strong>
                            ${money(total)}
                        </strong>

                    </div>

                </div>

            `;

        }
    );


    /*
     * SAFE IMAGE ERROR HANDLING
     *
     * IMPORTANT:
     * We DON'T set placeholder.jpg here.
     *
     * If image doesn't exist, simply replace
     * the broken image with an icon.
     */

    container
        .querySelectorAll(
            ".payment-product-img"
        )
        .forEach(
            img => {

                img.addEventListener(
                    "error",
                    function () {

                        const parent =
                            this.parentElement;


                        if (!parent) {

                            return;

                        }


                        this.remove();


                        const fallback =
                            document.createElement(
                                "div"
                            );


                        fallback.className =
                            "payment-no-image";


                        fallback.innerHTML = `

                            <i class="ri-image-line"></i>

                        `;


                        parent.insertBefore(
                            fallback,
                            parent.firstChild
                        );

                    },
                    {
                        once: true
                    }
                );

            }
        );

}

/* =========================================================
   ESCAPE HTML
========================================================= */
/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
/* =========================================================
   RENDER SUMMARY
========================================================= */

function renderPaymentSummary() {

    const order =
        pendingCheckout?.order;


    if (!order) {

        return;

    }


    const subtotal =
        Number(
            order.subtotal || 0
        );


    const discount =
        Number(
            order.discount || 0
        );


    const delivery =
        Number(
            order.deliveryCharge ||
            DELIVERY_ADVANCE
        );


    const total =
        Number(
            order.totalPrice ||
            (
                subtotal -
                discount +
                delivery
            )
        );


    const subtotalElement =
        document.getElementById(
            "summarySubtotal"
        );


    const discountElement =
        document.getElementById(
            "summaryDiscount"
        );


    const discountRow =
        document.getElementById(
            "summaryDiscountRow"
        );


    const totalElement =
        document.getElementById(
            "summaryTotal"
        );


    const advanceElement =
        document.getElementById(
            "advanceAmount"
        );


    if (subtotalElement) {

        subtotalElement.innerText =
            money(subtotal);

    }


    if (discountElement) {

        discountElement.innerText =
            "- " +
            money(discount);

    }


    if (discountRow) {

        discountRow.style.display =
            discount > 0
                ? "flex"
                : "none";

    }


    if (totalElement) {

        totalElement.innerText =
            money(total);

    }


    if (advanceElement) {

        advanceElement.innerText =
            money(delivery);

    }

}



/* =========================================================
   PAYMENT METHOD DETAILS
========================================================= */

function renderPaymentDetails(
    method
) {

    const container =
        document.getElementById(
            "paymentDetails"
        );


    if (!container) {

        return;

    }


    if (
        method ===
        "Easypaisa"
    ) {

        container.innerHTML = `

            <div class="gateway-box">

                <h3>
                    Easypaisa Payment
                </h3>

                <p>
                    Continue with Easypaisa to pay
                    your Rs.300 delivery advance.
                </p>

                <div class="gateway-field">

                    <label>
                        Easypaisa Mobile Number
                    </label>

                    <input
                        type="tel"
                        id="easypaisaNumber"
                        placeholder="03XXXXXXXXX"
                        maxlength="11"
                        inputmode="numeric"
                    >

                </div>

            </div>

        `;

        return;

    }


    if (
        method ===
        "JazzCash"
    ) {

        container.innerHTML = `

            <div class="gateway-box">

                <h3>
                    JazzCash Payment
                </h3>

                <p>
                    Continue with JazzCash to pay
                    your Rs.300 delivery advance.
                </p>

                <div class="gateway-field">

                    <label>
                        JazzCash Mobile Number
                    </label>

                    <input
                        type="tel"
                        id="jazzcashNumber"
                        placeholder="03XXXXXXXXX"
                        maxlength="11"
                        inputmode="numeric"
                    >

                </div>

            </div>

        `;

        return;

    }


    if (
        method ===
        "Credit Card"
    ) {

        container.innerHTML = `

            <div class="gateway-box">

                <h3>
                    Card Payment
                </h3>

                <p>
                    Enter your card details securely.
                </p>

                <div class="gateway-field">

                    <label>
                        Card Number
                    </label>

                    <input
                        type="text"
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        maxlength="19"
                        inputmode="numeric"
                    >

                </div>


                <div class="gateway-row">

                    <div class="gateway-field">

                        <label>
                            Expiry
                        </label>

                        <input
                            type="text"
                            id="cardExpiry"
                            placeholder="MM/YY"
                            maxlength="5"
                            inputmode="numeric"
                        >

                    </div>


                    <div class="gateway-field">

                        <label>
                            CVV
                        </label>

                        <input
                            type="password"
                            id="cardCvv"
                            placeholder="•••"
                            maxlength="4"
                            inputmode="numeric"
                        >

                    </div>

                </div>


                <div class="gateway-field">

                    <label>
                        Card Holder Name
                    </label>

                    <input
                        type="text"
                        id="cardHolder"
                        placeholder="Name on card"
                    >

                </div>

            </div>

        `;

        setupCardFormatting();

        return;

    }


    container.innerHTML = `

        <div class="details-placeholder">

            <i class="ri-lock-2-line"></i>

            <h3>
                Select a payment method
            </h3>

            <p>
                Your payment instructions will
                appear here.
            </p>

        </div>

    `;

}



/* =========================================================
   CARD FORMATTING
========================================================= */

function setupCardFormatting() {

    const cardNumber =
        document.getElementById(
            "cardNumber"
        );


    const expiry =
        document.getElementById(
            "cardExpiry"
        );


    if (cardNumber) {

        cardNumber.addEventListener(
            "input",
            () => {

                let value =
                    cardNumber.value
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            16
                        );


                value =
                    value.replace(
                        /(.{4})/g,
                        "$1 "
                    )
                        .trim();


                cardNumber.value =
                    value;

            }
        );

    }


    if (expiry) {

        expiry.addEventListener(
            "input",
            () => {

                let value =
                    expiry.value
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            4
                        );


                if (
                    value.length > 2
                ) {

                    value =
                        value.slice(
                            0,
                            2
                        ) +
                        "/" +
                        value.slice(
                            2
                        );

                }


                expiry.value =
                    value;

            }
        );

    }

}



/* =========================================================
   SELECT PAYMENT METHOD
========================================================= */

function selectPaymentMethod(
    method
) {

    selectedPaymentMethod =
        method;


    renderPaymentDetails(
        method
    );


    const button =
        document.getElementById(
            "payNowBtn"
        );


    if (!button) {

        return;

    }


    button.disabled =
        false;


    button.innerHTML = `

        <span>
            Pay ${money(DELIVERY_ADVANCE)}
        </span>

        <i class="ri-arrow-right-line"></i>

    `;

}



/* =========================================================
   VALIDATE PAYMENT DETAILS
========================================================= */

function validatePaymentDetails() {

    if (!selectedPaymentMethod) {

        showPaymentToast(
            "Please select a payment method."
        );

        return false;

    }


    if (
        selectedPaymentMethod ===
        "Easypaisa"
    ) {

        const input =
            document.getElementById(
                "easypaisaNumber"
            );


        const number =
            input?.value
                .replace(
                    /\D/g,
                    ""
                );


        if (
            !number ||
            number.length !== 11
        ) {

            showPaymentToast(
                "Enter a valid Easypaisa mobile number."
            );

            input?.focus();

            return false;

        }

    }


    if (
        selectedPaymentMethod ===
        "JazzCash"
    ) {

        const input =
            document.getElementById(
                "jazzcashNumber"
            );


        const number =
            input?.value
                .replace(
                    /\D/g,
                    ""
                );


        if (
            !number ||
            number.length !== 11
        ) {

            showPaymentToast(
                "Enter a valid JazzCash mobile number."
            );

            input?.focus();

            return false;

        }

    }


    if (
        selectedPaymentMethod ===
        "Credit Card"
    ) {

        const number =
            document.getElementById(
                "cardNumber"
            )?.value
                .replace(
                    /\D/g,
                    ""
                );


        const expiry =
            document.getElementById(
                "cardExpiry"
            )?.value.trim();


        const cvv =
            document.getElementById(
                "cardCvv"
            )?.value.trim();


        const holder =
            document.getElementById(
                "cardHolder"
            )?.value.trim();


        if (
            !number ||
            number.length < 13
        ) {

            showPaymentToast(
                "Enter a valid card number."
            );

            return false;

        }


        if (
            !expiry ||
            !/^\d{2}\/\d{2}$/.test(
                expiry
            )
        ) {

            showPaymentToast(
                "Enter a valid card expiry."
            );

            return false;

        }


        if (
            !cvv ||
            cvv.length < 3
        ) {

            showPaymentToast(
                "Enter a valid CVV."
            );

            return false;

        }


        if (!holder) {

            showPaymentToast(
                "Enter card holder name."
            );

            return false;

        }

    }


    return true;

}



/* =========================================================
   PAYMENT GATEWAY REQUEST
========================================================= */

async function createGatewayPayment() {

    /*
     * IMPORTANT:
     *
     * This is the production integration point.
     *
     * Your backend should eventually expose:
     *
     * POST /api/payments/create
     *
     * and return something like:
     *
     * {
     *   success: true,
     *   paymentUrl: "..."
     * }
     *
     * The frontend should then redirect
     * to that verified gateway.
     */


    const payload = {

        amount:
            DELIVERY_ADVANCE,

        paymentMethod:
            selectedPaymentMethod,

        order:
            pendingCheckout.order

    };


    /*
     * Don't send raw card data to your own
     * backend unless your payment provider
     * explicitly requires a secure tokenized flow.
     *
     * For production cards use the gateway's
     * client-side SDK/tokenization.
     */


    if (
        selectedPaymentMethod ===
        "Credit Card"
    ) {

        delete payload.order;

    }


    /*
     * CURRENTLY RETURN A READY-TO-INTEGRATE
     * RESULT.
     *
     * This prevents fake production payment.
     */

    return {

        requiresGateway:
            true,

        payload

    };

}



/* =========================================================
   CREATE ORDER AFTER VERIFIED PAYMENT
========================================================= */

async function createOrderAfterPayment(
    paymentResult
) {

    const order =
        pendingCheckout?.order;


    if (!order) {

        throw new Error(
            "Pending order not found."
        );

    }


    /*
     * IMPORTANT:
     *
     * Your MongoDB Order schema requires:
     *
     * user
     * products
     * totalPrice
     * address
     * city
     * phone
     *
     * So we send the authenticated
     * request and let backend identify
     * the logged-in user.
     *
     * If your current controller requires
     * user in body, add it server-side
     * from req.user._id instead.
     */


    const orderPayload = {

        products:
            order.products,

        totalPrice:
            Number(
                order.totalPrice || 0
            ),

        deliveryCharge:
            Number(
                order.deliveryCharge ||
                DELIVERY_ADVANCE
            ),

        deliveryChargeStatus:
            "Paid",

        address:
            order.address,

        city:
            order.city,

        phone:
            order.phone,

        paymentMethod:
            order.paymentMethod ||
            selectedPaymentMethod,

        paymentStatus:
            "Paid",

        status:
            "Confirmed",

        trackingNumber:
            "",

        trackingUrl:
            "",

        /*
         * Payment reference from
         * actual gateway.
         */

        paymentReference:
            paymentResult?.transactionId ||
            paymentResult?.reference ||
            ""

    };


    const data =
        await paymentApiRequest(
            PAYMENT_ORDER_API,
            {

                method:
                    "POST",

                body:
                    JSON.stringify(
                        orderPayload
                    )

            }
        );


    return data;

}



/* =========================================================
   CLEAR CART
========================================================= */

async function clearCartAfterPayment() {

    try {

        const response =
            await fetch(
                `${PAYMENT_CART_API}/clear`,
                {

                    method:
                        "DELETE",

                    headers: {

                        Authorization:
                            `Bearer ${getToken()}`

                    }

                }
            );


        if (
            response.ok
        ) {

            console.log(
                "Cart cleared successfully."
            );

            return true;

        }


        return false;

    }

    catch (error) {

        console.error(
            "Clear Cart Error:",
            error
        );

        return false;

    }

}



/* =========================================================
   CLEAN CHECKOUT STORAGE
========================================================= */

function clearCheckoutStorage() {

    localStorage.removeItem(
        PENDING_ORDER_KEY
    );


    localStorage.removeItem(
        APPLIED_COUPON_KEY
    );


    localStorage.removeItem(
        BUY_NOW_KEY
    );

}



/* =========================================================
   COMPLETE SUCCESS FLOW
========================================================= */

function completePaymentSuccess(
    orderData
) {

    /*
     * Save successful order
     * temporarily for success page.
     */

    try {

        localStorage.setItem(

            "lastOrder",

            JSON.stringify(
                orderData
            )

        );

    }

    catch (error) {

        console.error(
            "Last Order Save Error:",
            error
        );

    }


    clearCheckoutStorage();


    showSuccessModal();


    setTimeout(
        () => {

            window.location.href =
                "order-success.html";

        },
        1500
    );

}



/* =========================================================
   PROCESS PAYMENT
========================================================= */

async function processPayment() {

    if (isProcessing) {

        return;

    }


    if (
        !validatePaymentDetails()
    ) {

        return;

    }


    if (
        !pendingCheckout ||
        !pendingCheckout.order
    ) {

        showPaymentToast(
            "Your checkout session has expired. Please checkout again."
        );

        return;

    }


    isProcessing =
        true;


    const button =
        document.getElementById(
            "payNowBtn"
        );


    if (button) {

        button.disabled =
            true;

        button.innerHTML = `

            <span>
                Processing...
            </span>

            <i class="ri-loader-4-line"></i>

        `;

    }


    showProcessingModal();


    try {

        /*
         * =====================================================
         * REAL GATEWAY HOOK
         * =====================================================
         */

        const gateway =
            await createGatewayPayment();


        /*
         * IMPORTANT:
         *
         * At this stage a real gateway
         * should take over.
         *
         * We DO NOT pretend payment
         * happened.
         */


        if (
            gateway.requiresGateway
        ) {

            hideProcessingModal();


            /*
             * Since no real gateway is
             * configured yet, stop here.
             */

            showPaymentToast(

                "Payment gateway is not connected yet. Connect Easypaisa/JazzCash/Card gateway in the backend before accepting real payments."

            );


            resetPayButton();


            return;

        }


    }

    catch (error) {

        console.error(
            "Payment Error:",
            error
        );


        hideProcessingModal();


        showPaymentToast(
            error.message ||
            "Payment failed. Please try again."
        );


        resetPayButton();

    }

    finally {

        isProcessing =
            false;

    }

}



/* =========================================================
   DEMO / TEST SUCCESS
========================================================= */

/*
 * DO NOT use this function in production.
 *
 * It is provided only so you can test
 * the complete UI flow locally before
 * connecting the actual gateway.
 */

async function simulateTestPayment() {

    if (
        !pendingCheckout
    ) {

        return;

    }


    if (
        !validatePaymentDetails()
    ) {

        return;

    }


    const allowDemo =
        localStorage.getItem(
            "ZM_PAYMENT_TEST_MODE"
        ) === "true";


    if (!allowDemo) {

        showPaymentToast(
            "Test payment mode is disabled."
        );

        return;

    }


    if (isProcessing) {

        return;

    }


    isProcessing =
        true;


    showProcessingModal();


    try {

        /*
         * Simulated successful
         * payment reference.
         */

        const paymentResult = {

            success:
                true,

            transactionId:
                "TEST-" +
                Date.now(),

            reference:
                "ZM-TEST-" +
                Date.now()

        };


        /*
         * Create order only
         * after simulated success.
         */

        const orderData =
            await createOrderAfterPayment(
                paymentResult
            );


        /*
         * Clear normal cart.
         */

        if (
            !localStorage.getItem(
                BUY_NOW_KEY
            )
        ) {

            await clearCartAfterPayment();

        }


        hideProcessingModal();


        completePaymentSuccess(
            orderData
        );

    }

    catch (error) {

        console.error(
            "Test Payment Error:",
            error
        );


        hideProcessingModal();


        showPaymentToast(
            error.message ||
            "Unable to create order."
        );


        resetPayButton();

    }

    finally {

        isProcessing =
            false;

    }

}



/* =========================================================
   MODAL
========================================================= */

function showProcessingModal() {

    const modal =
        document.getElementById(
            "paymentProcessing"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}



function hideProcessingModal() {

    const modal =
        document.getElementById(
            "paymentProcessing"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}



function showSuccessModal() {

    const modal =
        document.getElementById(
            "paymentSuccess"
        );


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}



/* =========================================================
   RESET BUTTON
========================================================= */

function resetPayButton() {

    const button =
        document.getElementById(
            "payNowBtn"
        );


    if (!button) {

        return;

    }


    button.disabled =
        false;


    button.innerHTML = `

        <span>
            Pay ${money(DELIVERY_ADVANCE)}
        </span>

        <i class="ri-arrow-right-line"></i>

    `;

}



/* =========================================================
   TOAST
========================================================= */

function showPaymentToast(
    message
) {

    const toast =
        document.getElementById(
            "paymentToast"
        );


    if (!toast) {

        alert(message);

        return;

    }


    toast.innerText =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        showPaymentToast.timer
    );


    showPaymentToast.timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}



/* =========================================================
   CART COUNT
========================================================= */

async function updatePaymentCartCount() {

    const badge =
        document.getElementById(
            "cartCount"
        );


    if (!badge) {

        return;

    }


    const token =
        getToken();


    if (!token) {

        badge.innerText =
            "0";

        return;

    }


    try {

        const data =
            await paymentApiRequest(
                PAYMENT_CART_API,
                {

                    method:
                        "GET"

                }
            );


        const items =
            Array.isArray(
                data.items
            )
                ? data.items
                : [];


        let count =
            0;


        items.forEach(
            item => {

                count +=
                    Number(
                        item.quantity || 0
                    );

            }
        );


        badge.innerText =
            count;

    }

    catch {

        badge.innerText =
            "0";

    }

}



/* =========================================================
   EVENTS
========================================================= */

function setupPaymentEvents() {

    const methods =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    methods.forEach(
        radio => {

            radio.addEventListener(
                "change",
                () => {

                    selectPaymentMethod(
                        radio.value
                    );

                }
            );

        }
    );


    const payButton =
        document.getElementById(
            "payNowBtn"
        );


    if (payButton) {

        payButton.addEventListener(
            "click",
            processPayment
        );

    }


    const backButton =
        document.getElementById(
            "backCheckoutBtn"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "checkout.html";

            }
        );

    }

}



/* =========================================================
   DEVELOPMENT TEST MODE
========================================================= */

/*
 * To test complete order flow locally:
 *
 * Open browser console:
 *
 * localStorage.setItem(
 *     "ZM_PAYMENT_TEST_MODE",
 *     "true"
 * );
 *
 * Then select a method and call:
 *
 * simulateTestPayment();
 *
 * This is ONLY for development.
 *
 * Do NOT enable this on production.
 */

window.simulateTestPayment =
    simulateTestPayment;



/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            !checkPaymentLogin()
        ) {

            return;

        }


        pendingCheckout =
            loadPendingCheckout();


        if (
            !validatePendingCheckout(
                pendingCheckout
            )
        ) {

            showPaymentToast(
                "No pending checkout found. Please place your order again."
            );


            setTimeout(
                () => {

                    window.location.href =
                        "checkout.html";

                },
                1500
            );


            return;

        }


        renderPaymentItems();


        renderPaymentSummary();


        setupPaymentEvents();


        updatePaymentCartCount();


        console.log(
            "ZM PAYMENT READY",
            pendingCheckout
        );

    }
);
/* =========================================================
   ZM LABEL — REVIEWS
   ADD THIS PART AT THE VERY END OF product.js
========================================================= */


/* =========================================================
   REVIEW DOM
========================================================= */

const reviewForm =
    document.getElementById("reviewForm");

const reviewInput =
    document.getElementById("reviewInput");

const reviewsContainer =
    document.getElementById("reviewsContainer");

const reviewUserName =
    document.getElementById("reviewUserName");

const viewAllReviews =
    document.getElementById("viewAllReviews");


/* =========================================================
   GET LOGGED-IN USER
========================================================= */

async function loadLoggedInUserForReview() {

    if (!reviewUserName) {
        return;
    }


    const token =
        localStorage.getItem("token");


    if (!token) {

        reviewUserName.textContent =
            "Login to write a review";

        return;

    }


    try {

        /*
           Try common auth endpoint.
           Your existing backend can return
           user/name depending on your auth response.
        */

        const response =
            await fetch(
                `${API_ROOT}/auth/me`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        const user =
            data.user ||
            data.data ||
            data;


        const name =
            user.name ||
            user.fullName ||
            user.username ||
            user.firstName ||
            "";


        if (name) {

            reviewUserName.textContent =
                name;

        }

    }

    catch (error) {

        console.error(
            "REVIEW USER ERROR:",
            error
        );

    }

}


/* =========================================================
   LOAD REVIEWS
========================================================= */

async function loadProductReviews() {

    if (
        !reviewsContainer ||
        !productId
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_ROOT}/reviews/product/${encodeURIComponent(productId)}`
            );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        const reviews =
            Array.isArray(data.reviews)
                ? data.reviews
                : Array.isArray(data.data)
                    ? data.data
                    : [];


        renderProductReviews(
            reviews
        );

    }

    catch (error) {

        console.error(
            "REVIEWS LOAD ERROR:",
            error
        );

    }

}


/* =========================================================
   RENDER MULTIPLE REVIEWS
========================================================= */

function renderProductReviews(
    reviews
) {

    if (!reviewsContainer) {
        return;
    }


    if (!reviews.length) {

        reviewsContainer.innerHTML = `

            <div class="no-reviews">

                <p>
                    No reviews yet.
                </p>

            </div>

        `;

        return;

    }


    /*
       Show first 3 reviews initially.
       View All button opens the rest.
    */

    const visibleReviews =
        reviews.slice(0, 3);


    reviewsContainer.innerHTML =
        visibleReviews
            .map(
                renderSingleReview
            )
            .join("");


    if (
        viewAllReviews
    ) {

        if (
            reviews.length > 3
        ) {

            viewAllReviews.style.display =
                "inline-flex";


            viewAllReviews.textContent =
                `View All Reviews (${reviews.length})`;


            viewAllReviews.onclick =
                () => {

                    reviewsContainer.innerHTML =
                        reviews
                            .map(
                                renderSingleReview
                            )
                            .join("");


                    viewAllReviews.style.display =
                        "none";

                };

        }

        else {

            viewAllReviews.style.display =
                "none";

        }

    }

}


/* =========================================================
   SINGLE REVIEW
========================================================= */

function renderSingleReview(
    review
) {

    const name =
        escapeHTML(
            review.user?.name ||
            review.userName ||
            review.name ||
            "Customer"
        );


    const comment =
        escapeHTML(
            review.comment ||
            review.review ||
            review.text ||
            ""
        );


    const rating =
        Math.min(
            5,
            Math.max(
                0,
                Number(
                    review.rating
                ) || 0
            )
        );


    const stars =
        Array.from(
            { length: 5 },
            (_, index) =>
                index < rating
                    ? "★"
                    : "☆"
        ).join("");


    const date =
        review.createdAt
            ? new Date(
                review.createdAt
            ).toLocaleDateString(
                "en-GB",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            )
            : "";


    return `

        <article class="product-review">

            <div class="review-top">

                <div class="review-user">

                    <div class="review-avatar">

                        ${name
                            .charAt(0)
                            .toUpperCase()}

                    </div>


                    <div>

                        <h4>
                            ${name}
                        </h4>

                        ${
                            date
                                ? `<span>${date}</span>`
                                : ""
                        }

                    </div>

                </div>


                <div class="review-stars">

                    ${stars}

                </div>

            </div>


            <p class="review-text">

                ${comment}

            </p>

        </article>

    `;

}


/* =========================================================
   SUBMIT REVIEW
========================================================= */

if (reviewForm) {

    reviewForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const token =
                localStorage.getItem(
                    "token"
                );


            if (!token) {

                window.location.href =
                    "login.html";

                return;

            }


            if (!productId) {
                return;
            }


            const ratingElement =
                reviewForm.querySelector(
                    "[name='rating']:checked"
                );


            const commentElement =
                reviewForm.querySelector(
                    "[name='comment']"
                );


            const rating =
                Number(
                    ratingElement?.value
                );


            const comment =
                commentElement?.value.trim();


            if (!rating) {

                showAlert(
                    "warning",
                    "Rating Required",
                    "Please select a rating."
                );

                return;

            }


            if (!comment) {

                showAlert(
                    "warning",
                    "Review Required",
                    "Please write your review."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_ROOT}/reviews`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify({

                                    productId:
                                        productId,

                                    rating:
                                        rating,

                                    comment:
                                        comment

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    showAlert(
                        "error",
                        "Review Failed",
                        data.message ||
                        "Unable to submit review."
                    );

                    return;

                }


                showAlert(
                    "success",
                    "Review Added",
                    "Your review has been added.",
                    1500
                );


                reviewForm.reset();


                /*
                   Reload reviews so the new review
                   appears immediately.
                */

                await loadProductReviews();


            }

            catch (error) {

                console.error(
                    "SUBMIT REVIEW ERROR:",
                    error
                );


                showAlert(
                    "error",
                    "Error",
                    "Unable to submit review."
                );

            }

        }
    );

}


/* =========================================================
   REVIEW INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadLoggedInUserForReview();

        loadProductReviews();

    }
);


/* =========================================================
   GLOBAL
========================================================= */

window.loadProductReviews =
    loadProductReviews;