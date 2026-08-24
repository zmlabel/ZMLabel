/* ==========================================
   ZM LABEL
   CHECKOUT.JS
   CART + BUY NOW + COUPON SUPPORT
   DELIVERY ADVANCE PAYMENT SUPPORT
========================================== */


/* =========================================================
   API
========================================================= */

const CHECKOUT_CART_API =
    "http://localhost:5000/api/cart";

const ORDER_API =
    "http://localhost:5000/api/orders";

const COUPON_API =
    "http://localhost:5000/api/coupons";

const CHECKOUT_IMAGE_URL =
    "http://localhost:5000";


/* =========================================================
   DELIVERY PAYMENT
========================================================= */

const DELIVERY_CHARGE = 300;

const DELIVERY_PAYMENT_AMOUNT =
    DELIVERY_CHARGE;


/* =========================================================
   STORAGE KEYS
========================================================= */

const BUY_NOW_KEY =
    "buyNowProduct";

const PENDING_ORDER_KEY =
    "pendingCheckoutOrder";

const APPLIED_COUPON_KEY =
    "checkoutAppliedCoupon";


/* =========================================================
   COUPON STATE
========================================================= */

let appliedCoupon = null;

let appliedCouponDiscount = 0;

let currentCheckoutSubtotal = 0;

let currentCheckoutItems = 0;


/* =========================================================
   GET TOKEN
========================================================= */

function getToken() {

    return localStorage.getItem("token");

}

function isAdminTestEmail(email) {

    const testMode =
        String(
            window.ORDER_TEST_MODE || ""
        ).toLowerCase() === "true";

    const testEmail =
        String(
            window.ADMIN_TEST_EMAIL || ""
        ).trim()
        .toLowerCase();

    return (
        testMode &&
        !!testEmail &&
        String(email || "")
            .trim()
            .toLowerCase() === testEmail
    );

}


/* =========================================================
   IMAGE RESOLVER
========================================================= */

/*
 * IMPORTANT
 *
 * Backend images can come in different formats:
 *
 * filename.jpg
 * uploads/filename.jpg
 * /uploads/filename.jpg
 * http://localhost:5000/uploads/filename.jpg
 * https://...
 *
 * This function handles all of them.
 */

function getCheckoutProductImage(
    image
) {

    const PLACEHOLDER =
        "images/placeholder.jpg";


    if (!image) {

        return PLACEHOLDER;

    }


    let imageUrl =
        String(image).trim();


    if (!imageUrl) {

        return PLACEHOLDER;

    }


    /*
     * Already complete URL
     */

    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {

        return imageUrl;

    }


    /*
     * Remove accidental localhost duplication
     */

    imageUrl =
        imageUrl.replace(
            /^https?:\/\/localhost:5000\/?/i,
            ""
        );


    imageUrl =
        imageUrl.replace(
            /^https?:\/\/127\.0\.0\.1:5000\/?/i,
            ""
        );


    /*
     * If backend gives:
     *
     * /uploads/image.jpg
     */

    if (
        imageUrl.startsWith("/uploads/")
    ) {

        return (
            CHECKOUT_IMAGE_URL +
            imageUrl
        );

    }


    /*
     * If backend gives:
     *
     * uploads/image.jpg
     */

    if (
        imageUrl.startsWith("uploads/")
    ) {

        return (
            CHECKOUT_IMAGE_URL +
            "/" +
            imageUrl
        );

    }


    /*
     * If backend gives:
     *
     * /image.jpg
     *
     * treat it as root-relative backend path
     */

    if (
        imageUrl.startsWith("/")
    ) {

        return (
            CHECKOUT_IMAGE_URL +
            imageUrl
        );

    }


    /*
     * Normal filename:
     *
     * image.jpg
     *
     * Backend:
     *
     * http://localhost:5000/uploads/image.jpg
     */

    return (
        CHECKOUT_IMAGE_URL +
        "/uploads/" +
        imageUrl
    );

}


/* =========================================================
   GET PRODUCT IMAGE
========================================================= */

function getProductImage(
    product
) {

    if (!product) {

        return "images/placeholder.jpg";

    }


    /*
     * FIRST PRIORITY:
     *
     * product.image
     */

    if (
        product.image
    ) {

        return getCheckoutProductImage(
            product.image
        );

    }


    /*
     * SECOND PRIORITY:
     *
     * product.images[0]
     */

    if (
        Array.isArray(
            product.images
        ) &&
        product.images.length > 0
    ) {

        return getCheckoutProductImage(
            product.images[0]
        );

    }


    /*
     * Sometimes images can be object array:
     *
     * [
     *   { url: "..." }
     * ]
     */

    if (
        Array.isArray(
            product.images
        ) &&
        product.images.length > 0
    ) {

        const firstImage =
            product.images[0];


        if (
            typeof firstImage === "object"
        ) {

            return getCheckoutProductImage(
                firstImage.url ||
                firstImage.path ||
                firstImage.filename ||
                firstImage.image
            );

        }

    }


    return "images/placeholder.jpg";

}


/* =========================================================
   SAFE IMAGE ERROR
========================================================= */

function handleCheckoutImageError(
    imageElement
) {

    if (!imageElement) {

        return;

    }


    /*
     * Prevent infinite onerror loop.
     */

    if (
        imageElement.dataset.fallbackUsed ===
        "true"
    ) {

        return;

    }


    imageElement.dataset.fallbackUsed =
        "true";


    imageElement.src =
        "images/placeholder.jpg";

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeCheckoutHTML(
    value
) {

    return String(
        value || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   GET BUY NOW PRODUCT
========================================================= */

function getBuyNowProduct() {

    try {

        const data =
            localStorage.getItem(
                BUY_NOW_KEY
            );


        if (!data) {

            return null;

        }


        const parsed =
            JSON.parse(data);


        if (!parsed) {

            return null;

        }


        return parsed;

    }

    catch (error) {

        console.error(
            "Buy Now Product Error:",
            error
        );

        return null;

    }

}


/* =========================================================
   CHECK BUY NOW MODE
========================================================= */

function isBuyNowMode() {

    return !!getBuyNowProduct();

}


/* =========================================================
   GET CART
========================================================= */

async function getCheckoutCart() {

    try {

        const token =
            getToken();


        if (!token) {

            return [];

        }


        const response =
            await fetch(
                CHECKOUT_CART_API,
                {

                    method:
                        "GET",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        let data = {};


        try {

            data =
                await response.json();

        }

        catch {

            data = {};

        }


        if (!response.ok) {

            console.log(
                "Cart API Error:",
                data
            );

            return [];

        }


        return Array.isArray(
            data.items
        )
            ? data.items
            : [];

    }

    catch (error) {

        console.error(
            "Checkout Cart Error:",
            error
        );

        return [];

    }

}


/* =========================================================
   GET CHECKOUT ITEMS
   CART OR BUY NOW
========================================================= */

async function getCheckoutItems() {

    const buyNowProduct =
        getBuyNowProduct();


    /*
     * BUY NOW HAS PRIORITY
     */

    if (buyNowProduct) {

        console.log(
            "CHECKOUT MODE: BUY NOW"
        );


        const buyNowImage =
            buyNowProduct.image ||
            (
                Array.isArray(
                    buyNowProduct.images
                )
                    ? buyNowProduct.images[0]
                    : ""
            );


        return [

            {

                product: {

                    _id:
                        buyNowProduct.productId ||
                        buyNowProduct._id ||
                        buyNowProduct.product?._id,

                    name:
                        buyNowProduct.name ||
                        buyNowProduct.product?.name ||
                        "ZM LABEL Product",

                    price:
                        Number(
                            buyNowProduct.price ||
                            buyNowProduct.product?.price ||
                            0
                        ),

                    image:
                        buyNowImage ||
                        buyNowProduct.product?.image ||
                        "",

                    images:
                        buyNowProduct.images ||
                        buyNowProduct.product?.images ||
                        [],

                    discount:
                        Number(
                            buyNowProduct.discount ||
                            buyNowProduct.product?.discount ||
                            0
                        )

                },

                quantity:
                    Number(
                        buyNowProduct.quantity ||
                        1
                    ),

                size:
                    buyNowProduct.size ||
                    "",

                color:
                    buyNowProduct.color ||
                    ""

            }

        ];

    }


    /*
     * NORMAL CART
     */

    console.log(
        "CHECKOUT MODE: CART"
    );


    return await getCheckoutCart();

}


/* =========================================================
   CHECK LOGIN
========================================================= */

function checkLogin() {

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
   GET PRODUCT FINAL PRICE
========================================================= */

function getProductFinalPrice(
    product
) {

    if (!product) {

        return 0;

    }


    const price =
        Number(
            product.price || 0
        );


    const discount =
        Number(
            product.discount || 0
        );


    if (discount > 0) {

        return Math.round(

            price -
            (
                price *
                discount /
                100
            )

        );

    }


    return price;

}


/* =========================================================
   LOAD CHECKOUT
========================================================= */

async function loadCheckout() {

    const container =
        document.getElementById(
            "checkoutItems"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="checkout-loading">

            Loading your order...

        </div>

    `;


    /*
     * BUY NOW
     */

    const buyNowProduct =
        getBuyNowProduct();


    if (buyNowProduct) {

        console.log(
            "BUY NOW CHECKOUT:",
            buyNowProduct
        );


        renderBuyNowProduct(
            container,
            buyNowProduct
        );


        restoreAppliedCoupon();


        return;

    }


    /*
     * NORMAL CART
     */

    const items =
        await getCheckoutCart();


    /*
     * EMPTY
     */

    if (
        !items ||
        items.length === 0
    ) {

        container.innerHTML = `

            <div class="checkout-loading">

                Your cart is empty.

            </div>

        `;


        showCheckoutToast(
            "Your cart is empty."
        );


        updateCheckoutTotals(
            0,
            0
        );


        return;

    }


    let subtotal =
        0;

    let totalItems =
        0;


    container.innerHTML =
        "";


    items.forEach(
        item => {

            if (!item) {

                return;

            }


            /*
             * Some cart APIs return:
             *
             * item.product
             *
             * while others may return
             * populated product directly.
             */

            const product =
                item.product ||
                item;


            if (!product) {

                return;

            }


            const quantity =
                Math.max(
                    1,
                    Number(
                        item.quantity ||
                        1
                    )
                );


            const finalPrice =
                getProductFinalPrice(
                    product
                );


            const itemTotal =
                finalPrice *
                quantity;


            subtotal +=
                itemTotal;


            totalItems +=
                quantity;


            /*
             * GET ACTUAL PRODUCT IMAGE
             */

            const image =
                getProductImage(
                    product
                );


            const productName =
                product.name ||
                "ZM LABEL Product";


            const safeName =
                escapeCheckoutHTML(
                    productName
                );


            const size =
                item.size ||
                "";


            const color =
                item.color ||
                "";


            const variantText = [];


            if (size) {

                variantText.push(
                    `Size: ${escapeCheckoutHTML(size)}`
                );

            }


            if (color) {

                variantText.push(
                    `Color: ${escapeCheckoutHTML(color)}`
                );

            }


            const variants =
                variantText.join(
                    " • "
                );


            container.innerHTML += `

                <div class="checkout-product">

                    <div class="checkout-product-image">

                        <img
                            src="${image}"
                            alt="${safeName}"
                            loading="eager"
                            onerror="handleCheckoutImageError(this)"
                        >

                        <span class="checkout-qty">
                            ${quantity}
                        </span>

                    </div>


                    <div class="checkout-product-info">

                        <h3>
                            ${safeName}
                        </h3>


                        ${
                            variants
                                ? `
                                    <p>
                                        ${variants}
                                    </p>
                                `
                                : ""
                        }


                        <strong>
                            Rs. ${itemTotal.toLocaleString()}
                        </strong>

                    </div>

                </div>

            `;

        }
    );


    updateCheckoutTotals(
        subtotal,
        totalItems
    );


    restoreAppliedCoupon();

}


/* =========================================================
   RENDER BUY NOW PRODUCT
========================================================= */

function renderBuyNowProduct(
    container,
    buyNowProduct
) {

    container.innerHTML =
        "";


    const quantity =
        Math.max(
            1,
            Number(
                buyNowProduct.quantity ||
                1
            )
        );


    const price =
        Number(
            buyNowProduct.price ||
            0
        );


    const discount =
        Number(
            buyNowProduct.discount ||
            0
        );


    const finalPrice =
        discount > 0

            ? Math.round(

                price -
                (
                    price *
                    discount /
                    100
                )

            )

            : price;


    const itemTotal =
        finalPrice *
        quantity;


    /*
     * GET ACTUAL IMAGE
     */

    const image =
        getProductImage(
            buyNowProduct
        );


    const productName =
        buyNowProduct.name ||
        "ZM LABEL Product";


    const safeName =
        escapeCheckoutHTML(
            productName
        );


    const variantParts = [];


    if (
        buyNowProduct.size
    ) {

        variantParts.push(
            `Size: ${escapeCheckoutHTML(
                buyNowProduct.size
            )}`
        );

    }


    if (
        buyNowProduct.color
    ) {

        variantParts.push(
            `Color: ${escapeCheckoutHTML(
                buyNowProduct.color
            )}`
        );

    }


    const variants =
        variantParts.join(
            " • "
        );


    container.innerHTML = `

        <div class="checkout-product">

            <div class="checkout-product-image">

                <img
                    src="${image}"
                    alt="${safeName}"
                    loading="eager"
                    onerror="handleCheckoutImageError(this)"
                >

                <span class="checkout-qty">
                    ${quantity}
                </span>

            </div>


            <div class="checkout-product-info">

                <h3>
                    ${safeName}
                </h3>


                ${
                    variants
                        ? `
                            <p>
                                ${variants}
                            </p>
                        `
                        : ""
                }


                <strong>
                    Rs. ${itemTotal.toLocaleString()}
                </strong>

            </div>

        </div>

    `;


    updateCheckoutTotals(
        itemTotal,
        quantity
    );

}


/* =========================================================
   UPDATE TOTALS
========================================================= */

function updateCheckoutTotals(
    subtotal,
    totalItems
) {

    currentCheckoutSubtotal =
        Number(
            subtotal || 0
        );


    currentCheckoutItems =
        Number(
            totalItems || 0
        );


    /*
     * SAFETY
     */

    if (
        appliedCouponDiscount >
        currentCheckoutSubtotal
    ) {

        appliedCouponDiscount =
            currentCheckoutSubtotal;

    }


    const subtotalElement =
        document.getElementById(
            "subtotal"
        );


    const deliveryElement =
        document.getElementById(
            "deliveryCharge"
        );


    const totalElement =
        document.getElementById(
            "total"
        );


    const itemCountElement =
        document.getElementById(
            "itemCount"
        );


    const discountAmountElement =
        document.getElementById(
            "discountAmount"
        );


    const discountRow =
        document.getElementById(
            "discountRow"
        );


    /*
     * SUBTOTAL
     */

    if (subtotalElement) {

        subtotalElement.innerText =
            "Rs. " +
            currentCheckoutSubtotal
                .toLocaleString();

    }


    /*
     * COUPON DISCOUNT
     */

    if (discountAmountElement) {

        discountAmountElement.innerText =

            appliedCouponDiscount > 0

                ? "- Rs. " +
                    appliedCouponDiscount
                        .toLocaleString()

                : "- Rs. 0";

    }


    /*
     * DISCOUNT ROW
     */

    if (discountRow) {

        discountRow.style.display =

            appliedCouponDiscount > 0

                ? "flex"

                : "none";

    }


    /*
     * DELIVERY
     */

    if (deliveryElement) {

        deliveryElement.innerText =
            "Rs. " +
            DELIVERY_CHARGE
                .toLocaleString();

    }


    /*
     * DISCOUNTED SUBTOTAL
     */

    const discountedSubtotal =
        Math.max(
            0,
            currentCheckoutSubtotal -
            appliedCouponDiscount
        );


    /*
     * GRAND TOTAL
     */

    const grandTotal =
        discountedSubtotal +
        DELIVERY_CHARGE;


    if (totalElement) {

        totalElement.innerText =
            "Rs. " +
            grandTotal
                .toLocaleString();

    }


    /*
     * ITEM COUNT
     */

    if (itemCountElement) {

        itemCountElement.innerText =
            `${currentCheckoutItems} ${
                currentCheckoutItems === 1
                    ? "Item"
                    : "Items"
            }`;

    }


    updateCouponUI();

}


/* =========================================================
   APPLY COUPON
========================================================= */

async function applyCoupon() {

    const input =
        document.getElementById(
            "couponCode"
        );


    const button =
        document.getElementById(
            "applyCouponBtn"
        );


    if (!input) {

        console.error(
            "Coupon input #couponCode not found."
        );

        return;

    }


    const code =
        input.value
            .trim()
            .toUpperCase();


    if (!code) {

        showCouponMessage(
            "Please enter a coupon code.",
            "error"
        );

        return;

    }


    if (
        currentCheckoutSubtotal <= 0
    ) {

        showCouponMessage(
            "There is no subtotal to apply a coupon.",
            "error"
        );

        return;

    }


    if (
        appliedCoupon &&
        appliedCoupon.code === code
    ) {

        showCouponMessage(
            "This coupon is already applied.",
            "success"
        );

        return;

    }


    if (button) {

        button.disabled =
            true;


        button.dataset.originalText =
            button.innerHTML;


        button.innerHTML =
            "Applying...";

    }


    try {

        const response =
            await fetch(
                `${COUPON_API}/validate`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${getToken()}`

                    },

                    body:
                        JSON.stringify({

                            code:
                                code,

                            subtotal:
                                currentCheckoutSubtotal

                        })

                }
            );


        let data = {};


        try {

            data =
                await response.json();

        }

        catch {

            data = {};

        }


        console.log(
            "Coupon Validation:",
            data
        );


        if (
            response.ok &&
            data.success
        ) {

            appliedCoupon = {

                id:
                    data.coupon?.id ||
                    data.coupon?._id ||
                    "",

                code:
                    data.coupon?.code ||
                    code,

                discountType:
                    data.coupon?.discountType ||
                    "",

                discountValue:
                    Number(
                        data.coupon?.discountValue ||
                        0
                    )

            };


            appliedCouponDiscount =
                Number(
                    data.discountAmount ||
                    0
                );


            appliedCouponDiscount =
                Math.min(
                    appliedCouponDiscount,
                    currentCheckoutSubtotal
                );


            localStorage.setItem(

                APPLIED_COUPON_KEY,

                JSON.stringify({

                    coupon:
                        appliedCoupon,

                    discount:
                        appliedCouponDiscount

                })

            );


            showCouponMessage(
                data.message ||
                "Coupon applied successfully.",
                "success"
            );


            updateCheckoutTotals(
                currentCheckoutSubtotal,
                currentCheckoutItems
            );


            updateCouponUI();


            return;

        }


        showCouponMessage(
            data.message ||
            "Invalid coupon code.",
            "error"
        );

    }

    catch (error) {

        console.error(
            "Apply Coupon Error:",
            error
        );


        showCouponMessage(
            "Unable to apply coupon. Please try again.",
            "error"
        );

    }

    finally {

        if (button) {

            button.disabled =
                false;


            button.innerHTML =
                button.dataset.originalText ||
                "Apply";

        }

    }

}


/* =========================================================
   REMOVE COUPON
========================================================= */

function removeCoupon() {

    appliedCoupon =
        null;


    appliedCouponDiscount =
        0;


    localStorage.removeItem(
        APPLIED_COUPON_KEY
    );


    const input =
        document.getElementById(
            "couponCode"
        );


    if (input) {

        input.value =
            "";

    }


    showCouponMessage(
        "Coupon removed.",
        "success"
    );


    updateCheckoutTotals(
        currentCheckoutSubtotal,
        currentCheckoutItems
    );


    updateCouponUI();

}


/* =========================================================
   RESTORE COUPON
========================================================= */

function restoreAppliedCoupon() {

    try {

        const saved =
            localStorage.getItem(
                APPLIED_COUPON_KEY
            );


        if (!saved) {

            return;

        }


        const parsed =
            JSON.parse(saved);


        if (
            !parsed ||
            !parsed.coupon
        ) {

            return;

        }


        const savedDiscount =
            Number(
                parsed.discount ||
                0
            );


        if (
            savedDiscount <= 0 ||
            currentCheckoutSubtotal <= 0
        ) {

            localStorage.removeItem(
                APPLIED_COUPON_KEY
            );

            return;

        }


        appliedCoupon =
            parsed.coupon;


        appliedCouponDiscount =
            Math.min(
                savedDiscount,
                currentCheckoutSubtotal
            );


        const input =
            document.getElementById(
                "couponCode"
            );


        if (
            input &&
            appliedCoupon.code
        ) {

            input.value =
                appliedCoupon.code;

        }


        updateCheckoutTotals(
            currentCheckoutSubtotal,
            currentCheckoutItems
        );


        showCouponMessage(
            `${appliedCoupon.code} applied.`,
            "success"
        );

    }

    catch (error) {

        console.error(
            "Restore Coupon Error:",
            error
        );


        localStorage.removeItem(
            APPLIED_COUPON_KEY
        );

    }

}


/* =========================================================
   UPDATE COUPON UI
========================================================= */

function updateCouponUI() {

    const applyButton =
        document.getElementById(
            "applyCouponBtn"
        );


    const removeButton =
        document.getElementById(
            "removeCouponBtn"
        );


    const input =
        document.getElementById(
            "couponCode"
        );


    if (appliedCoupon) {

        if (input) {

            input.value =
                appliedCoupon.code;

            input.disabled =
                true;

        }


        if (applyButton) {

            applyButton.style.display =
                "none";

        }


        if (removeButton) {

            removeButton.style.display =
                "inline-flex";

        }

    }

    else {

        if (input) {

            input.disabled =
                false;

        }


        if (applyButton) {

            applyButton.style.display =
                "inline-flex";

        }


        if (removeButton) {

            removeButton.style.display =
                "none";

        }

    }


    const discountRow =
        document.getElementById(
            "discountRow"
        );


    if (discountRow) {

        discountRow.style.display =
            appliedCouponDiscount > 0
                ? "flex"
                : "none";

    }

}


/* =========================================================
   COUPON MESSAGE
========================================================= */

function showCouponMessage(
    message,
    type = "error"
) {

    const element =
        document.getElementById(
            "couponMessage"
        );


    if (!element) {

        console.log(
            "COUPON:",
            message
        );

        return;

    }


    element.innerText =
        message;


    element.className =
        "coupon-message";


    element.classList.add(
        type
    );


    element.style.display =
        "block";

}


/* =========================================================
   CLEAR CART
   ONLY NORMAL CART CHECKOUT
========================================================= */

async function clearCheckoutCart() {

    try {

        const response =
            await fetch(
                `${CHECKOUT_CART_API}/clear`,
                {

                    method:
                        "DELETE",

                    headers: {

                        Authorization:
                            `Bearer ${getToken()}`

                    }

                }
            );


        let data = {};


        try {

            data =
                await response.json();

        }

        catch {

            data = {};

        }


        console.log(
            "Clear Cart Response:",
            data
        );


        if (!response.ok) {

            console.error(
                "Cart Clear Failed:",
                data
            );

            return false;

        }


        return true;

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
   CLEAR BUY NOW
========================================================= */

function clearBuyNowProduct() {

    localStorage.removeItem(
        BUY_NOW_KEY
    );

}


/* =========================================================
   CLEAR CHECKOUT COUPON
========================================================= */

function clearCheckoutCoupon() {

    appliedCoupon =
        null;


    appliedCouponDiscount =
        0;


    localStorage.removeItem(
        APPLIED_COUPON_KEY
    );

}


/* =========================================================
   BUILD ORDER DATA
========================================================= */

async function buildPendingOrderData() {

    const fullName =
        document.getElementById(
            "fullName"
        )?.value.trim();


    const email =
        document.getElementById(
            "email"
        )?.value.trim();


    const phone =
        document.getElementById(
            "phone"
        )?.value.trim();


    const city =
        document.getElementById(
            "city"
        )?.value.trim();


    const address =
        document.getElementById(
            "address"
        )?.value.trim();


    const payment =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    /*
     * VALIDATION
     */

    if (!fullName) {

        showCheckoutToast(
            "Please enter your full name."
        );

        return null;

    }


    if (!email) {

        showCheckoutToast(
            "Please enter your email."
        );

        return null;

    }


    if (!phone) {

        showCheckoutToast(
            "Please enter your phone number."
        );

        return null;

    }


    if (!city) {

        showCheckoutToast(
            "Please enter your city."
        );

        return null;

    }


    if (!address) {

        showCheckoutToast(
            "Please enter your complete address."
        );

        return null;

    }


    if (!payment) {

        showCheckoutToast(
            "Please select a payment method."
        );

        return null;

    }


    /*
     * GET ITEMS
     */

    const items =
        await getCheckoutItems();


    if (
        !items ||
        items.length === 0
    ) {

        showCheckoutToast(
            "There is no product to order."
        );

        return null;

    }


    /*
     * PREPARE ITEMS
     */

    let subtotal =
        0;


    const orderItems =
        items
            .filter(
                item =>
                    item &&
                    item.product
            )
            .map(
                item => {

                    const product =
                        item.product;


                    const finalPrice =
                        getProductFinalPrice(
                            product
                        );


                    const quantity =
                        Math.max(
                            1,
                            Number(
                                item.quantity ||
                                1
                            )
                        );


                    subtotal +=
                        finalPrice *
                        quantity;


                    /*
                     * PRODUCT IMAGE
                     */

                    const productImage =
                        product.image ||
                        (
                            Array.isArray(
                                product.images
                            )
                                ? product.images[0]
                                : ""
                        );


                    return {

                        /*
                         * MongoDB product ID
                         */

                        product:
                            product._id,


                        /*
                         * DISPLAY INFORMATION
                         */

                        name:
                            product.name ||
                            "ZM LABEL Product",


                        image:
                            productImage ||
                            "",


                        /*
                         * Keep multiple
                         * images available
                         */

                        images:
                            Array.isArray(
                                product.images
                            )
                                ? product.images
                                : [],


                        /*
                         * VARIANTS
                         */

                        size:
                            item.size ||
                            "",


                        color:
                            item.color ||
                            "",


                        /*
                         * QUANTITY + PRICE
                         */

                        quantity:
                            quantity,


                        price:
                            finalPrice

                    };

                }
            );


    /*
     * SAFETY
     */

    if (
        orderItems.length === 0
    ) {

        showCheckoutToast(
            "Unable to prepare product information."
        );

        return null;

    }


    /*
     * FRESH SUBTOTAL
     */

    currentCheckoutSubtotal =
        subtotal;


    /*
     * COUPON SAFETY
     */

    const validDiscount =
        Math.min(
            Number(
                appliedCouponDiscount ||
                0
            ),
            subtotal
        );


    appliedCouponDiscount =
        validDiscount;


    /*
     * DISCOUNTED SUBTOTAL
     */

    const discountedSubtotal =
        Math.max(
            0,
            subtotal -
            validDiscount
        );


    /*
     * FINAL TOTAL
     */

    const finalOrderTotal =
        discountedSubtotal +
        DELIVERY_CHARGE;


    /*
     * ORDER DATA
     */

    return {

        customer: {

            fullName:
                fullName,

            email:
                email

        },


        products:
            orderItems,


        totalPrice:
            finalOrderTotal,


        subtotal:
            subtotal,


        discount:
            validDiscount,


        couponCode:
            appliedCoupon
                ? appliedCoupon.code
                : "",


        deliveryCharge:
            DELIVERY_CHARGE,


        address:
            address,


        city:
            city,


        phone:
            phone,


        paymentMethod:
            payment.value,


        /*
         * DELIVERY ADVANCE
         */

        deliveryPayment: {

            required:
                true,

            amount:
                DELIVERY_PAYMENT_AMOUNT,

            status:
                "pending"

        }

    };

}


/* =========================================================
   START DELIVERY PAYMENT
========================================================= */
async function startDeliveryPayment(pendingOrder) {

    if (!pendingOrder) {
        return;
    }

    try {

        /*
         * CHECK BACKEND FOR ADMIN TEST MODE
         */

        const response = await fetch(
            `${ORDER_API}/test-mode`,
            {
                method: "GET",

                headers: {
                    Authorization:
                        `Bearer ${getToken()}`
                }
            }
        );

        const data = await response.json();

        /*
         * ADMIN TEST ACCOUNT ONLY
         */

        if (
            response.ok &&
            data?.success === true &&
            data?.isAdminTestOrder === true
        ) {

            /*
             * DIRECT ORDER
             * NO Rs.300 PAYMENT PAGE
             */

            const orderResponse =
                await fetch(
                    ORDER_API,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${getToken()}`
                        },

                        body:
                            JSON.stringify({

                                products:
                                    pendingOrder.products,

                                totalPrice:
                                    pendingOrder.totalPrice,

                                address:
                                    pendingOrder.address,

                                city:
                                    pendingOrder.city,

                                phone:
                                    pendingOrder.phone,

                                paymentMethod:
                                    pendingOrder.paymentMethod

                            })
                    }
                );


            const orderData =
                await orderResponse.json();


            if (!orderResponse.ok) {

                throw new Error(
                    orderData?.message ||
                    "Unable to place order."
                );

            }


            clearBuyNowProduct();

            clearCheckoutCoupon();

            await clearCheckoutCart();

            localStorage.removeItem(
                PENDING_ORDER_KEY
            );


            showCheckoutToast(
                "Test order placed successfully."
            );


            setTimeout(() => {

                window.location.href =
                    "order-success.html";

            }, 700);


            return;
        }


        /*
         * NORMAL CUSTOMER
         * Rs.300 PAYMENT REQUIRED
         */

        localStorage.setItem(
            PENDING_ORDER_KEY,
            JSON.stringify({

                order:
                    pendingOrder,

                deliveryAdvance:
                    DELIVERY_PAYMENT_AMOUNT,

                createdAt:
                    Date.now()

            })
        );


        showCheckoutToast(
            `Rs.${DELIVERY_PAYMENT_AMOUNT.toLocaleString()} delivery advance required.`
        );


        setTimeout(() => {

            window.location.href =
                "payment.html";

        }, 500);


    }
    catch (error) {

        console.error(
            "Delivery Payment Error:",
            error
        );

        showCheckoutToast(
            error.message ||
            "Unable to continue checkout."
        );

    }

}
/* =========================================================
   PLACE ORDER
========================================================= */

async function placeOrder() {

    const button =
        document.getElementById(
            "placeOrderBtn"
        );


    /*
     * LOGIN
     */

    if (!checkLogin()) {

        return;

    }


    /*
     * PREVENT DOUBLE CLICK
     */

    if (
        button &&
        button.disabled
    ) {

        return;

    }


    /*
     * BUILD ORDER
     */

    const pendingOrder =
        await buildPendingOrderData();


    if (!pendingOrder) {

        return;

    }


    /*
     * DISABLE BUTTON
     */

    if (button) {

        button.disabled =
            true;


        button.innerHTML = `

            <span>
                Continue to Payment
            </span>

            <i class="ri-arrow-right-line"></i>

        `;

    }


    await startDeliveryPayment(
        pendingOrder
    );

}


/* =========================================================
   RESET PLACE ORDER BUTTON
========================================================= */

function resetPlaceOrderButton() {

    const button =
        document.getElementById(
            "placeOrderBtn"
        );


    if (!button) {

        return;

    }


    button.disabled =
        false;


    button.innerHTML = `

        <span>
            Pay Rs.300 Delivery Charges
        </span>

        <i class="ri-arrow-right-line"></i>

    `;

}


/* =========================================================
   CHECKOUT TOAST
========================================================= */

function showCheckoutToast(
    message
) {

    const toast =
        document.getElementById(
            "checkoutToast"
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
        showCheckoutToast.timer
    );


    showCheckoutToast.timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   CART COUNT
========================================================= */

async function updateCheckoutCartCount() {

    const badge =
        document.getElementById(
            "cartCount"
        );


    if (!badge) {

        return;

    }


    /*
     * BUY NOW
     */

    if (isBuyNowMode()) {

        badge.innerText =
            "0";

        return;

    }


    const items =
        await getCheckoutCart();


    let total =
        0;


    items.forEach(
        item => {

            total +=
                Number(
                    item.quantity ||
                    0
                );

        }
    );


    badge.innerText =
        total;

}


/* =========================================================
   COUPON EVENTS
========================================================= */

function setupCouponEvents() {

    const input =
        document.getElementById(
            "couponCode"
        );


    const applyButton =
        document.getElementById(
            "applyCouponBtn"
        );


    const removeButton =
        document.getElementById(
            "removeCouponBtn"
        );


    if (applyButton) {

        applyButton.addEventListener(
            "click",
            applyCoupon
        );

    }


    if (removeButton) {

        removeButton.addEventListener(
            "click",
            removeCoupon
        );

    }


    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    applyCoupon();

                }

            }
        );

    }


    updateCouponUI();

}


/* =========================================================
   PAYMENT METHOD UI
========================================================= */

function setupPaymentMethods() {

    const paymentOptions =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    paymentOptions.forEach(
        radio => {

            radio.addEventListener(
                "change",
                () => {

                    console.log(
                        "Product Payment Method:",
                        radio.value
                    );

                }
            );

        }
    );

}


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.getCheckoutProductImage =
    getCheckoutProductImage;


window.getProductImage =
    getProductImage;


window.handleCheckoutImageError =
    handleCheckoutImageError;


window.placeOrder =
    placeOrder;


window.applyCoupon =
    applyCoupon;


window.removeCoupon =
    removeCoupon;


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * LOGIN
         */

        if (!checkLogin()) {

            return;

        }


        /*
         * LOAD CHECKOUT
         */

        loadCheckout();


        /*
         * CART BADGE
         */

        updateCheckoutCartCount();


        /*
         * COUPON
         */

        setupCouponEvents();


        /*
         * PAYMENT METHODS
         */

        setupPaymentMethods();


        /*
         * PLACE ORDER
         */

        const button =
            document.getElementById(
                "placeOrderBtn"
            );


        if (button) {

            button.innerHTML = `

                <span>
                    Pay Rs.300 Delivery Charges
                </span>

                <i class="ri-arrow-right-line"></i>

            `;


            button.addEventListener(
                "click",
                placeOrder
            );

        }


        console.log(
            "ZM LABEL CHECKOUT READY"
        );

    }
);