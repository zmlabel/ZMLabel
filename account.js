/* ==========================================
   ZM LABEL
   ACCOUNT.JS
========================================== */


/* ==========================================
   API
========================================== */




/* ==========================================
   TOKEN
========================================== */

function getToken() {
    return localStorage.getItem("token");
}


/* ==========================================
   LOGIN CHECK
========================================== */

function checkLogin() {

    if (!getToken()) {

        window.location.href = "login.html";

        return false;
    }

    return true;
}


/* ==========================================
   GET LOCAL USER
========================================== */

function getLocalUser() {

    try {

        const user = localStorage.getItem("user");

        if (!user) {
            return null;
        }

        return JSON.parse(user);

    } catch (error) {

        console.error("User data error:", error);

        return null;
    }
}


/* ==========================================
   LOAD USER
   NO /auth/me REQUEST
========================================== */

function loadUser() {

    if (!checkLogin()) return;

    const user = getLocalUser();

    console.log("User Profile:", user);


    const sidebarName =
        document.getElementById("sidebarName");

    const sidebarEmail =
        document.getElementById("sidebarEmail");

    const nameInput =
        document.getElementById("name");

    const emailInput =
        document.getElementById("email");

    const phoneInput =
        document.getElementById("phone");

    const cityInput =
        document.getElementById("city");

    const addressInput =
        document.getElementById("address");


    /* ==========================================
       USER DATA
    ========================================== */

    const name =
        user?.name || "ZM LABEL User";

    const email =
        user?.email || "";

    const phone =
        user?.phone || "";

    const city =
        user?.city || "";

    const address =
        user?.address || "";


    /* ==========================================
       SIDEBAR
    ========================================== */

    if (sidebarName) {

        sidebarName.innerText = name;
    }

    if (sidebarEmail) {

        sidebarEmail.innerText = email;
    }


    /* ==========================================
       PROFILE
    ========================================== */

    if (nameInput) {

        nameInput.value = name;
    }

    if (emailInput) {

        emailInput.value = email;
    }

    if (phoneInput) {

        phoneInput.value = phone;
    }

    if (cityInput) {

        cityInput.value = city;
    }

    if (addressInput) {

        addressInput.value = address;
    }
}


/* ==========================================
   PROFILE FORM
========================================== */

function setupProfileForm() {

    const form =
        document.getElementById("profileForm");

    if (!form) return;


    form.addEventListener("submit", function (e) {

        e.preventDefault();


        const message =
            document.getElementById("profileMessage");


        const name =
            document.getElementById("name")?.value.trim() || "";

        const phone =
            document.getElementById("phone")?.value.trim() || "";

        const city =
            document.getElementById("city")?.value.trim() || "";

        const address =
            document.getElementById("address")?.value.trim() || "";


        if (!name) {

            if (message) {

                message.innerText =
                    "Please enter your name.";

                message.classList.remove("success");

                message.classList.add("error");
            }

            return;
        }


        /* ==========================================
           GET EXISTING USER
        ========================================== */

        let user = getLocalUser() || {};


        /* ==========================================
           UPDATE USER
        ========================================== */

        user.name = name;

        user.phone = phone;

        user.city = city;

        user.address = address;


        /* ==========================================
           SAVE USER
        ========================================== */

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );


        /* ==========================================
           UPDATE SIDEBAR
        ========================================== */

        const sidebarName =
            document.getElementById("sidebarName");

        if (sidebarName) {

            sidebarName.innerText = name;
        }


        /* ==========================================
           MESSAGE
        ========================================== */

        if (message) {

            message.innerText =
                "Profile saved successfully.";

            message.classList.remove("error");

            message.classList.add("success");
        }


        console.log(
            "Updated User:",
            user
        );

    });
}


/* ==========================================
   ACCOUNT MENU
========================================== */

function setupAccountMenu() {

    const buttons =
        document.querySelectorAll(
            ".account-menu-btn[data-section]"
        );


    const sections = {

        profile:
            document.getElementById("profileSection"),

        orders:
            document.getElementById("ordersSection"),

        wishlist:
            document.getElementById("wishlistSection"),

        cart:
            document.getElementById("cartSection")
    };


    buttons.forEach(button => {

        button.addEventListener("click", function () {

            const target =
                this.dataset.section;


            if (!sections[target]) {
                return;
            }


            /* REMOVE ACTIVE */

            buttons.forEach(btn => {

                btn.classList.remove("active");

            });


            this.classList.add("active");


            /* HIDE SECTIONS */

            Object.values(sections).forEach(section => {

                if (section) {

                    section.classList.remove("active");
                }
            });


            /* SHOW SECTION */

            sections[target].classList.add("active");


            /* LOAD DATA */

            if (target === "orders") {

                loadOrders();
            }


            if (target === "wishlist") {

                loadWishlist();
            }


            if (target === "cart") {

                loadAccountCart();
            }

        });

    });
}


/* ==========================================
   LOAD ORDERS
========================================== */

async function loadOrders() {

    const container =
        document.getElementById("ordersContainer");

    if (!container) return;


    container.innerHTML = `
        <div class="section-loading">
            Loading orders...
        </div>
    `;


    try {

        const response =
            await fetch(
                `${ORDERS_API}/myorders`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${getToken()}`
                    }
                }
            );


        const data =
            await response.json();


        console.log("Orders:", data);


        if (!response.ok || !data.success) {

            container.innerHTML = `
                <div class="section-loading">
                    Unable to load orders.
                </div>
            `;

            return;
        }


        const orders =
            data.orders || [];


        /* NO ORDERS */

        if (orders.length === 0) {

            container.innerHTML = `
                <div class="section-loading">

                    <i class="ri-shopping-bag-line"></i>

                    <h3>
                        No Orders Yet
                    </h3>

                    <p>
                        Your orders will appear here.
                    </p>

                    <a href="hoodies.html">
                        Start Shopping
                    </a>

                </div>
            `;

            return;
        }


        /* RENDER ORDERS */

        container.innerHTML = "";


        orders.forEach(order => {

            const date =
                order.createdAt
                    ? new Date(
                        order.createdAt
                    ).toLocaleDateString(
                        "en-PK",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    )
                    : "—";


            const total =
                Number(
                    order.totalPrice || 0
                );


            const status =
                order.status || "Pending";


            const orderId =
                order._id
                    ? String(order._id)
                        .slice(-8)
                        .toUpperCase()
                    : "--------";


            container.innerHTML += `

                <article class="order-card">

                    <div class="order-header">

                        <div>

                            <span>
                                ORDER
                            </span>

                            <strong>
                                #${orderId}
                            </strong>

                        </div>

                        <span class="order-status">
                            ${status}
                        </span>

                    </div>


                    <div class="order-details">

                        <div>

                            <small>
                                Date
                            </small>

                            <strong>
                                ${date}
                            </strong>

                        </div>


                        <div>

                            <small>
                                Payment
                            </small>

                            <strong>
                                ${order.paymentMethod || "COD"}
                            </strong>

                        </div>


                        <div>

                            <small>
                                Total
                            </small>

                            <strong>
                                Rs.${total.toLocaleString()}
                            </strong>

                        </div>

                    </div>

                </article>
            `;

        });

    }

    catch (error) {

        console.error(
            "Orders Error:",
            error
        );


        container.innerHTML = `
            <div class="section-loading">
                Failed to load orders.
            </div>
        `;
    }
}


/* ==========================================
   LOAD WISHLIST
========================================== */

async function loadWishlist() {

    const container =
        document.getElementById("wishlistContainer");

    if (!container) return;


    container.innerHTML = `
        <div class="section-loading">
            Loading wishlist...
        </div>
    `;


    const token = getToken();


    if (!token) {

        container.innerHTML = `
            <div class="section-loading">
                Please login to view wishlist.
            </div>
        `;

        return;
    }


    try {

        const response =
            await fetch(
                WISHLIST_API,
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


        console.log(
            "Wishlist:",
            data
        );


        const products =
            Array.isArray(data.products)
                ? data.products
                : [];


        if (!data.success || products.length === 0) {

            container.innerHTML = `
                <div class="section-loading">

                    <i class="ri-heart-line"></i>

                    <h3>
                        Your Wishlist Is Empty
                    </h3>

                    <p>
                        Products you save will appear here.
                    </p>

                </div>
            `;

            updateAccountWishlistCount();

            return;
        }


        container.innerHTML = "";


        products.forEach(product => {

            const image =
                product.image
                    ? `http://localhost:5000/uploads/${product.image}`
                    : "images/placeholder.jpg";


            container.innerHTML += `

                <article class="account-product-card">

                    <img
                        src="${image}"
                        alt="${product.name || "Product"}"
                        loading="lazy"
                    >


                    <div>

                        <span>
                            ${product.brand || "ZM LABEL"}
                        </span>

                        <h3>
                            ${product.name || "Product"}
                        </h3>

                        <strong>
                            Rs.${Number(
                                product.price || 0
                            ).toLocaleString()}
                        </strong>

                    </div>


                    <a
                        href="product.html?id=${product._id}"
                    >
                        View
                    </a>

                </article>
            `;

        });


        updateAccountWishlistCount();

    }

    catch (error) {

        console.error(
            "Wishlist Error:",
            error
        );


        container.innerHTML = `
            <div class="section-loading">
                Unable to load wishlist.
            </div>
        `;
    }
}


/* ==========================================
   GET CART
   DIRECTLY FROM LOCAL STORAGE
========================================== */

function getAccountCart() {

    try {

        const cart =
            JSON.parse(
                localStorage.getItem("cart")
            );


        if (Array.isArray(cart)) {

            return cart;
        }


        return [];

    }

    catch (error) {

        console.error(
            "Cart Parse Error:",
            error
        );

        return [];
    }
}


/* ==========================================
   CART TOTAL QUANTITY
========================================== */

function getCartTotalQuantity() {

    const cart =
        getAccountCart();


    return cart.reduce(
        (total, item) => {

            return total +
                Number(
                    item.quantity || 0
                );

        },
        0
    );
}


/* ==========================================
   ACCOUNT CART
========================================== */

function loadAccountCart() {

    const countElement =
        document.getElementById(
            "accountCartCount"
        );


    const total =
        getCartTotalQuantity();


    if (countElement) {

        countElement.innerText =
            total;
    }


    updateHeaderCartCount();
}


/* ==========================================
   HEADER CART COUNT
========================================== */

function updateHeaderCartCount() {

    const badge =
        document.getElementById(
            "cartCount"
        );


    if (!badge) return;


    const total =
        getCartTotalQuantity();


    badge.innerText =
        total;
}


/* ==========================================
   HEADER WISHLIST COUNT
========================================== */

async function updateAccountWishlistCount() {

    const badge =
        document.getElementById(
            "wishlistCount"
        );


    if (!badge) return;


    const token =
        getToken();


    if (!token) {

        badge.innerText = "0";

        return;
    }


    try {

        const response =
            await fetch(
                WISHLIST_API,
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
            data.success &&
            Array.isArray(data.products)
        ) {

            badge.innerText =
                data.products.length;

        }

        else {

            badge.innerText = "0";
        }

    }

    catch (error) {

        console.error(
            "Wishlist Count Error:",
            error
        );

        badge.innerText = "0";
    }
}


/* ==========================================
   MOBILE MENU
========================================== */

function setupMobileMenu() {

    const menuBtn =
        document.getElementById(
            "menuBtn"
        );


    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );


    const closeMenu =
        document.getElementById(
            "closeMenu"
        );


    if (!menuBtn || !mobileMenu) {
        return;
    }


    menuBtn.addEventListener(
        "click",
        () => {

            mobileMenu.classList.add(
                "active"
            );
        }
    );


    if (closeMenu) {

        closeMenu.addEventListener(
            "click",
            () => {

                mobileMenu.classList.remove(
                    "active"
                );
            }
        );
    }
}


/* ==========================================
   LOGOUT
========================================== */

function setupLogout() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (!logoutBtn) return;


    logoutBtn.addEventListener(
        "click",
        () => {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {
                return;
            }


            localStorage.removeItem("token");

            localStorage.removeItem("user");


            window.location.href =
                "login.html";
        }
    );
}


/* ==========================================
   CART COUNT AUTO UPDATE
========================================== */

window.addEventListener(
    "storage",
    function (event) {

        if (event.key === "cart") {

            updateHeaderCartCount();

            loadAccountCart();
        }
    }
);


/* ==========================================
   PAGE FOCUS
========================================== */

window.addEventListener(
    "focus",
    function () {

        updateHeaderCartCount();

        loadAccountCart();
    }
);


/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "✅ ZM LABEL Account Page Loaded"
        );


        /* LOGIN */

        if (!checkLogin()) {
            return;
        }


        /* USER */

        loadUser();


        /* ORDERS */

        loadOrders();


        /* CART */

        loadAccountCart();


        /* WISHLIST */

        await updateAccountWishlistCount();


        /* MENU */

        setupAccountMenu();


        /* PROFILE */

        setupProfileForm();


        /* MOBILE */

        setupMobileMenu();


        /* LOGOUT */

        setupLogout();


        /* FINAL CART COUNT */

        updateHeaderCartCount();

    }
);