/* =========================================================
   ZM LABEL
   PREMIUM ORDERS PAGE
   ========================================================= */

const API = "http://localhost:5000/api";

let currentOrders = [];


/* =========================================================
   DOM
   ========================================================= */

const ordersContainer =
    document.getElementById("ordersContainer");

const ordersLoading =
    document.getElementById("ordersLoading");

const emptyOrders =
    document.getElementById("emptyOrders");

const ordersTotal =
    document.getElementById("ordersTotal");

const orderModal =
    document.getElementById("orderModal");

const modalContent =
    document.getElementById("modalContent");

const closeModal =
    document.getElementById("closeModal");

const modalOverlay =
    document.querySelector(".modal-overlay");


/* =========================================================
   TOKEN
   ========================================================= */

function getToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken")
    );

}


/* =========================================================
   LOAD ORDERS
   ========================================================= */

async function loadOrders() {

    const token = getToken();

    if (!token) {

        window.location.href = "login.html";

        return;
    }


    if (ordersLoading) {

        ordersLoading.style.display = "flex";

    }


    if (emptyOrders) {

        emptyOrders.style.display = "none";

    }


    try {

        const response = await fetch(
            `${API}/orders/myorders`,
            {
                method: "GET",

                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );


        /* =========================================
           AUTH ERROR
           ========================================= */

        if (response.status === 401) {

            localStorage.removeItem("token");
            localStorage.removeItem("authToken");
            localStorage.removeItem("accessToken");

            window.location.href = "login.html";

            return;
        }


        if (!response.ok) {

            throw new Error(
                `Server Error ${response.status}`
            );

        }


        const data = await response.json();


        console.log(
            "ORDERS RESPONSE:",
            data
        );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Failed to load orders"
            );

        }


        currentOrders =
            Array.isArray(data.orders)
                ? data.orders
                : [];


        console.log(
            "CURRENT ORDERS:",
            currentOrders
        );


        renderOrders(currentOrders);

    }

    catch (error) {

        console.error(
            "GET ORDERS ERROR:",
            error
        );

        showError();

    }

}


/* =========================================================
   RENDER ORDERS
   ========================================================= */

function renderOrders(orders) {

    if (ordersLoading) {

        ordersLoading.style.display = "none";

    }


    /* =========================================
       NO ORDERS
       ========================================= */

    if (
        !Array.isArray(orders) ||
        orders.length === 0
    ) {

        if (ordersTotal) {

            ordersTotal.textContent = "0 ORDERS";

        }


        if (ordersContainer) {

            ordersContainer.innerHTML = "";

        }


        if (emptyOrders) {

            emptyOrders.style.display = "flex";

        }


        return;
    }


    /* =========================================
       ORDER COUNT
       ========================================= */

    if (ordersTotal) {

        ordersTotal.textContent =
            `${orders.length} ${
                orders.length === 1
                    ? "ORDER"
                    : "ORDERS"
            }`;

    }


    if (emptyOrders) {

        emptyOrders.style.display = "none";

    }


    /* =========================================
       CREATE CARDS
       ========================================= */

    if (ordersContainer) {

        ordersContainer.innerHTML =
            orders
                .map(
                    (order, index) =>
                        createOrderCard(
                            order,
                            index
                        )
                )
                .join("");

    }

}


/* =========================================================
   CREATE ORDER CARD
   ========================================================= */

function createOrderCard(order, index) {

    const orderId =
        order?._id || "";


    const shortOrderId =
        orderId
            .slice(-8)
            .toUpperCase();


    const status =
        order?.status || "Pending";


    const statusClass =
        status
            .toLowerCase()
            .replace(/\s+/g, "-");


    const date =
        order?.createdAt
            ? formatDate(order.createdAt)
            : "N/A";


    const products =
        Array.isArray(order?.products)
            ? order.products
            : [];


    /* =========================================
       REAL ITEM COUNT
       ========================================= */

    const itemCount =
        products.reduce(
            (total, item) => {

                return (
                    total +
                    Number(item?.quantity || 0)
                );

            },
            0
        );


    /* =========================================
       ORDER TOTAL

       IMPORTANT:
       This is the actual amount stored
       in Order.totalPrice.

       Example:
       Product = 3000
       Discounted order total = 2700
       ========================================= */

    const total =
        Number(order?.totalPrice || 0);


    /* =========================================
       PRODUCT SECTION
       ========================================= */

    let productsHTML = "";


    if (products.length > 0) {

        productsHTML =
            products
                .map(
                    item =>
                        createProduct(item)
                )
                .join("");

    }

    else {

        productsHTML = createUnavailableProduct();

    }


    /* =========================================
       CARD
       ========================================= */

    return `

        <article
            class="order-card"
            data-order-index="${index}"
        >

            <!-- =================================
                 ORDER HEADER
                 ================================= -->

            <div class="order-top">

                <div class="order-main-info">

                    <span class="order-label">
                        ORDER
                    </span>

                    <h2 class="order-number">
                        #${escapeHTML(shortOrderId)}
                    </h2>

                    <span class="order-date">
                        ${escapeHTML(date)}
                    </span>

                </div>


                <div
                    class="order-status ${statusClass}"
                >

                    <span class="status-dot"></span>

                    ${escapeHTML(status)}

                </div>

            </div>


            <!-- =================================
                 PRODUCTS
                 ================================= -->

            <div class="order-products">

                ${productsHTML}

            </div>


            <!-- =================================
                 ORDER FOOTER
                 ================================= -->

            <div class="order-footer">


                <div class="order-stats">


                    <div class="order-stat">

                        <span>
                            ITEMS
                        </span>

                        <strong>
                            ${itemCount}
                        </strong>

                    </div>


                    <div class="order-stat">

                        <span>
                            PAYMENT
                        </span>

                        <strong>
                            ${escapeHTML(
                                order?.paymentMethod ||
                                "COD"
                            )}
                        </strong>

                    </div>


                    <div class="order-stat">

                        <span>
                            TOTAL
                        </span>

                        <strong>
                            Rs. ${formatPrice(total)}
                        </strong>

                    </div>


                </div>


                <button
                    class="view-order-btn"
                    type="button"
                    onclick="openOrderDetails(${index})"
                >

                    <span>
                        VIEW DETAILS
                    </span>

                    <i class="ri-arrow-right-line"></i>

                </button>


            </div>


        </article>

    `;

}


/* =========================================================
   CREATE PRODUCT
   ========================================================= */

function createProduct(item) {

    const product =
        item?.product;


    /*
       IMPORTANT

       Sometimes MongoDB order may contain a
       product reference which no longer exists.

       In that case populate() gives null.

       We don't want the whole order card to break.
    */

    if (
        !product ||
        typeof product !== "object"
    ) {

        return createUnavailableProduct();

    }


    const name =
        product.name ||
        "Product";


    const brand =
        product.brand ||
        "ZM LABEL";


    const quantity =
        Number(
            item?.quantity || 1
        );


    const price =
        Number(
            product.price || 0
        );


    /* =========================================
       IMAGE

       Product schema:

       image: "1786363302818-oversized.jpeg"

       Backend uploads folder:

       http://localhost:5000/uploads/
       ========================================= */

    const image =
        product.image
            ? `${getImageURL(product.image)}`
            : "";


    return `

        <div class="order-product">


            <!-- PRODUCT IMAGE -->

            <div class="product-image-wrap">

                ${
                    image

                    ?

                    `

                        <img
                            class="product-image"
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}"
                            loading="lazy"
                            onerror="handleImageError(this)"
                        >

                    `

                    :

                    `

                        <div
                            class="product-image-empty"
                        >

                            <i
                                class="ri-image-line"
                            ></i>

                        </div>

                    `
                }

            </div>


            <!-- PRODUCT INFORMATION -->

            <div class="product-info">


                <span class="product-brand">

                    ${escapeHTML(brand)}

                </span>


                <h3 class="product-name">

                    ${escapeHTML(name)}

                </h3>


                <div class="product-meta">

                    <span>
                        QTY ${quantity}
                    </span>

                </div>


                <strong class="product-price">

                    Rs. ${formatPrice(price)}

                </strong>


            </div>


        </div>

    `;

}


/* =========================================================
   UNAVAILABLE PRODUCT
   ========================================================= */

function createUnavailableProduct() {

    return `

        <div class="no-products">

            <div class="no-product-icon">

                <i class="ri-shopping-bag-3-line"></i>

            </div>


            <div class="no-product-content">

                <strong>
                    Product information unavailable
                </strong>

                <span>
                    This product is no longer available
                    in the catalog.
                </span>

            </div>

        </div>

    `;

}


/* =========================================================
   IMAGE URL
   ========================================================= */

function getImageURL(image) {

    if (!image) {

        return "";

    }


    /*
       Already full URL
    */

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {

        return image;

    }


    /*
       Your backend uploads folder
    */

    return `http://localhost:5000/uploads/${image}`;

}


/* =========================================================
   IMAGE ERROR
   ========================================================= */

function handleImageError(img) {

    if (!img) return;


    img.style.display = "none";


    const parent =
        img.parentElement;


    if (!parent) return;


    parent.classList.add(
        "image-error"
    );


    if (
        !parent.querySelector(
            ".image-error-icon"
        )
    ) {

        parent.insertAdjacentHTML(
            "beforeend",

            `

                <div class="image-error-icon">

                    <i class="ri-image-line"></i>

                </div>

            `
        );

    }

}


/* =========================================================
   OPEN ORDER DETAILS
   ========================================================= */

function openOrderDetails(index) {

    const order =
        currentOrders[index];


    if (!order) return;


    const products =
        Array.isArray(order.products)
            ? order.products
            : [];


    const itemCount =
        products.reduce(
            (total, item) => {

                return (
                    total +
                    Number(item?.quantity || 0)
                );

            },
            0
        );


    const total =
        Number(
            order.totalPrice || 0
        );


    const status =
        order.status ||
        "Pending";


    const orderId =
        order._id || "";


    const productsHTML =
        products.length

        ?

        products
            .map(
                item => {

                    const product =
                        item?.product;


                    if (
                        !product ||
                        typeof product !== "object"
                    ) {

                        return `

                            <div class="modal-product unavailable">

                                <div>

                                    <strong>
                                        Product unavailable
                                    </strong>

                                    <span>
                                        Product information
                                        is no longer available.
                                    </span>

                                </div>

                            </div>

                        `;

                    }


                    const quantity =
                        Number(
                            item?.quantity || 1
                        );


                    const price =
                        Number(
                            product.price || 0
                        );


                    return `

                        <div class="modal-product">


                            <div class="modal-product-info">

                                <strong>
                                    ${escapeHTML(
                                        product.name ||
                                        "Product"
                                    )}
                                </strong>

                                <span>
                                    ${
                                        escapeHTML(
                                            product.brand ||
                                            "ZM LABEL"
                                        )
                                    }
                                </span>

                                <small>
                                    Quantity: ${quantity}
                                </small>

                            </div>


                            <strong>

                                Rs. ${formatPrice(price)}

                            </strong>


                        </div>

                    `;

                }
            )
            .join("")

        :

        `

            <div class="modal-product unavailable">

                <strong>
                    Product information unavailable
                </strong>

            </div>

        `;


    /* =========================================
       MODAL HTML
       ========================================= */

    if (!modalContent) return;


    modalContent.innerHTML = `

        <div class="modal-order-header">


            <div>

                <span class="modal-eyebrow">
                    ORDER
                </span>


                <h2>
                    #${escapeHTML(
                        orderId
                            .slice(-8)
                            .toUpperCase()
                    )}
                </h2>


                <span class="modal-date">

                    ${
                        order.createdAt
                            ? formatDate(
                                order.createdAt
                            )
                            : "N/A"
                    }

                </span>

            </div>


            <div class="modal-status ${status
                .toLowerCase()
                .replace(/\s+/g, "-")}">

                <span class="status-dot"></span>

                ${escapeHTML(status)}

            </div>


        </div>


        <div class="modal-divider"></div>


        <!-- ORDER SUMMARY -->

        <div class="modal-grid">


            <div>

                <span>
                    ORDER DATE
                </span>

                <strong>

                    ${
                        order.createdAt
                            ? formatDate(
                                order.createdAt
                            )
                            : "N/A"
                    }

                </strong>

            </div>


            <div>

                <span>
                    ITEMS
                </span>

                <strong>
                    ${itemCount}
                </strong>

            </div>


            <div>

                <span>
                    PAYMENT
                </span>

                <strong>
                    ${escapeHTML(
                        order.paymentMethod ||
                        "COD"
                    )}
                </strong>

            </div>


            <div>

                <span>
                    TOTAL
                </span>

                <strong>
                    Rs. ${formatPrice(total)}
                </strong>

            </div>


        </div>


        <div class="modal-divider"></div>


        <!-- PRODUCTS -->

        <div class="modal-products-section">

            <div class="section-heading">

                <span>
                    YOUR ITEMS
                </span>

                <strong>
                    ${itemCount}
                    ${
                        itemCount === 1
                            ? " ITEM"
                            : " ITEMS"
                    }
                </strong>

            </div>


            ${productsHTML}

        </div>


        <div class="modal-divider"></div>


        <!-- DELIVERY -->

        <div class="shipping-section">


            <div class="section-heading">

                <span>
                    DELIVERY DETAILS
                </span>

            </div>


            <div class="delivery-box">


                <div>

                    <i class="ri-map-pin-line"></i>

                    <span>
                        ${escapeHTML(
                            order.address ||
                            "Address unavailable"
                        )}
                    </span>

                </div>


                <div>

                    <i class="ri-building-line"></i>

                    <span>
                        ${escapeHTML(
                            order.city ||
                            "City unavailable"
                        )}
                    </span>

                </div>


                <div>

                    <i class="ri-phone-line"></i>

                    <span>
                        ${escapeHTML(
                            order.phone ||
                            "Phone unavailable"
                        )}
                    </span>

                </div>


            </div>


        </div>


        <div class="modal-total">

            <span>
                ORDER TOTAL
            </span>

            <strong>
                Rs. ${formatPrice(total)}
            </strong>

        </div>

    `;


    /* =========================================
       OPEN
       ========================================= */

    orderModal.classList.add(
        "active"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeOrderModal() {

    if (!orderModal) return;


    orderModal.classList.remove(
        "active"
    );


    document.body.style.overflow =
        "";

}


if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeOrderModal
    );

}


if (modalOverlay) {

    modalOverlay.addEventListener(
        "click",
        closeOrderModal
    );

}


/* ESC KEY */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeOrderModal();

        }

    }
);


/* =========================================================
   DATE
   ========================================================= */

function formatDate(date) {

    try {

        return new Date(date)
            .toLocaleDateString(
                "en-PK",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

    }

    catch {

        return "N/A";

    }

}


/* =========================================================
   PRICE
   ========================================================= */

function formatPrice(price) {

    return Number(
        price || 0
    ).toLocaleString(
        "en-PK"
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
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
   ERROR
   ========================================================= */

function showError() {

    if (ordersLoading) {

        ordersLoading.style.display =
            "none";

    }


    if (ordersTotal) {

        ordersTotal.textContent =
            "ERROR";

    }


    if (ordersContainer) {

        ordersContainer.innerHTML = `

            <div class="orders-error">

                <div class="error-icon">

                    <i class="ri-error-warning-line"></i>

                </div>


                <h3>
                    Something went wrong
                </h3>


                <p>
                    We couldn't load your orders.
                    Please try again.
                </p>


                <button
                    type="button"
                    onclick="loadOrders()"
                >

                    TRY AGAIN

                    <i class="ri-refresh-line"></i>

                </button>

            </div>

        `;

    }

}


/* =========================================================
   INIT
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadOrders();

    }
);