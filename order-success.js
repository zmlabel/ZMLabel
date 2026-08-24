/* ==========================================
   ZM LABEL
   ORDER SUCCESS JS
========================================== */

const SUCCESS_ORDER_API =
    "http://localhost:5000/api/orders";


/* ==========================================
   TOKEN
========================================== */

function getSuccessToken() {

    return localStorage.getItem("token");

}


/* ==========================================
   FORMAT PRICE
========================================== */

function formatSuccessPrice(value) {

    return Number(value || 0)
        .toLocaleString("en-PK");

}


/* ==========================================
   LOAD LATEST ORDER
========================================== */

async function loadSuccessOrder() {

    try {

        const token =
            getSuccessToken();


        if (!token) {

            return;

        }


        const response =
            await fetch(
                `${SUCCESS_ORDER_API}/myorders`,
                {

                    method: "GET",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success ||
            !Array.isArray(data.orders) ||
            data.orders.length === 0
        ) {

            showEmptyOrder();

            return;

        }


        /*
         * Backend already sorts newest first.
         */

        const order =
            data.orders[0];


        renderOrder(order);

    }

    catch (error) {

        console.error(
            "ORDER SUCCESS ERROR:",
            error
        );

        showEmptyOrder();

    }

}


/* ==========================================
   RENDER ORDER
========================================== */

function renderOrder(order) {


    /* ======================================
       ORDER ID
    ======================================= */

    const orderId =
        document.getElementById(
            "orderId"
        );


    if (orderId) {

        const fullId =
            String(order._id || "");


        orderId.innerText =
            fullId
                ? `ZM-${fullId.slice(-6).toUpperCase()}`
                : "ZM-000000";

    }


    /* ======================================
       ADDRESS
    ======================================= */

    const address =
        document.getElementById(
            "address"
        );

    const city =
        document.getElementById(
            "city"
        );

    const phone =
        document.getElementById(
            "phone"
        );


    if (address) {

        address.innerText =
            order.address || "—";

    }


    if (city) {

        city.innerText =
            order.city || "—";

    }


    if (phone) {

        phone.innerText =
            order.phone || "—";

    }


    /* ======================================
       PAYMENT
    ======================================= */

    const paymentMethod =
        document.getElementById(
            "paymentMethod"
        );

    const paymentStatus =
        document.getElementById(
            "paymentStatus"
        );


    if (paymentMethod) {

        paymentMethod.innerText =
            order.paymentMethod || "COD";

    }


    if (paymentStatus) {

        paymentStatus.innerText =
            `Payment ${
                order.paymentStatus || "Pending"
            }`;

    }


    /* ======================================
       PRODUCTS
    ======================================= */

    renderProducts(
        order.products || []
    );


    /* ======================================
       TOTAL
    ======================================= */

    const total =
        Number(
            order.totalPrice || 0
        );


    const delivery =
        Number(
            order.deliveryCharge || 0
        );


    /*
     * Your backend stores totalPrice.
     * Therefore we show the stored total
     * as the final order total.
     */

    const subtotal =
        Math.max(
            0,
            total - delivery
        );


    const subtotalElement =
        document.getElementById(
            "subtotal"
        );

    const deliveryElement =
        document.getElementById(
            "delivery"
        );

    const totalElement =
        document.getElementById(
            "total"
        );


    if (subtotalElement) {

        subtotalElement.innerText =
            `Rs. ${formatSuccessPrice(subtotal)}`;

    }


    if (deliveryElement) {

        deliveryElement.innerText =
            delivery > 0
                ? `Rs. ${formatSuccessPrice(delivery)}`
                : "FREE";

    }


    if (totalElement) {

        totalElement.innerText =
            `Rs. ${formatSuccessPrice(total)}`;

    }

}


/* ==========================================
   PRODUCTS
========================================== */

function renderProducts(products) {

    const container =
        document.getElementById(
            "productsList"
        );


    const itemCount =
        document.getElementById(
            "itemCount"
        );


    if (!container) return;


    if (
        !Array.isArray(products) ||
        products.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-order">
                Product information unavailable.
            </div>

        `;

        return;

    }


    let totalQuantity = 0;


    container.innerHTML =
        products
            .map(item => {


                const product =
                    item.product;


                if (!product) {

                    return "";

                }


                const quantity =
                    Number(
                        item.quantity || 1
                    );


                totalQuantity +=
                    quantity;


                const price =
                    Number(
                        item.price ??
                        product.price ??
                        0
                    );


                const productName =
                    product.name ||
                    "Product";


                const brand =
                    product.brand ||
                    "ZM LABEL";


                const image =
                    product.image
                        ? `http://localhost:5000/uploads/${product.image}`
                        : "images/placeholder.jpg";


                let options = "";


                if (item.size) {

                    options +=
                        `Size: ${item.size}`;

                }


                if (item.color) {

                    if (options) {

                        options +=
                            " • ";

                    }

                    options +=
                        `Color: ${item.color}`;

                }


                return `

                    <div class="product-item">


                        <div class="product-image">

                            <img
                                src="${image}"
                                alt="${productName}"
                                onerror="this.src='images/placeholder.jpg'"
                            >

                        </div>


                        <div class="product-info">


                            <span class="product-brand">
                                ${brand}
                            </span>


                            <strong class="product-name">
                                ${productName}
                            </strong>


                            ${
                                options
                                    ? `
                                        <span class="product-options">
                                            ${options}
                                        </span>
                                    `
                                    : ""
                            }


                            <span class="product-qty">
                                Quantity: ${quantity}
                            </span>


                        </div>


                        <strong class="product-price">

                            Rs.
                            ${formatSuccessPrice(
                                price * quantity
                            )}

                        </strong>


                    </div>

                `;

            })
            .join("");


    if (itemCount) {

        itemCount.innerText =
            `${totalQuantity} ${
                totalQuantity === 1
                    ? "Item"
                    : "Items"
            }`;

    }

}


/* ==========================================
   EMPTY
========================================== */

function showEmptyOrder() {

    const container =
        document.getElementById(
            "productsList"
        );


    if (container) {

        container.innerHTML = `

            <div class="empty-order">

                Your order details
                are currently unavailable.

            </div>

        `;

    }

}


/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSuccessOrder();

    }
);