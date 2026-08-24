/* =========================================================
   ZM LABEL
   CART.JS
   BACKEND CART
   FIXED / SAFE VERSION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       API CONFIG
    ===================================================== */

    const API_ROOT =
        window.ZM_API_BASE ||
        `${window.location.protocol}//${window.location.hostname}:5000/api`;

    const CART_API =
        `${API_ROOT.replace(/\/+$/, "")}/cart`;


    /* =====================================================
       DOM
    ===================================================== */

    const container =
        document.getElementById("cartContainer");

    const emptyCart =
        document.getElementById("emptyCart");

    const cartPage =
        document.querySelector(".cart-page");

    const itemCount =
        document.getElementById("itemCount");

    const subtotalElement =
        document.getElementById("subtotal");

    const grandTotalElement =
        document.getElementById("grandTotal");

    const checkoutBtn =
        document.getElementById("checkoutBtn");

    const cartCount =
        document.getElementById("cartCount");


    /* =====================================================
       TOKEN
    ===================================================== */

    function getToken() {

        return localStorage.getItem("token");

    }


    /* =====================================================
       SERVER BASE
    ===================================================== */

    function getServerBase() {

        const apiBase =
            window.ZM_API_BASE ||
            `${window.location.protocol}//${window.location.hostname}:5000/api`;

        return apiBase.replace(
            /\/api\/?$/,
            ""
        );

    }


    /* =====================================================
       IMAGE URL
    ===================================================== */

    function getImageUrl(image) {

        if (!image) {
            return "";
        }

        const value =
            String(image).trim();

        if (!value) {
            return "";
        }

        /* Already full URL */

        if (
            value.startsWith("http://") ||
            value.startsWith("https://") ||
            value.startsWith("data:")
        ) {

            return value;

        }


        let cleanImage =
            value.replace(/^\/+/, "");


        /* Remove uploads/ if already included */

        cleanImage =
            cleanImage.replace(
                /^uploads\//i,
                ""
            );


        return `${getServerBase()}/uploads/${cleanImage}`;

    }


    /* =====================================================
       FETCH CART
    ===================================================== */

    async function getCart() {

        const token =
            getToken();

        if (!token) {
            return [];
        }


        try {

            const response =
                await fetch(
                    CART_API,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            /* ==========================================
               AUTH EXPIRED
            ========================================== */

            if (
                response.status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "currentUser"
                );

                if (
                    window.location.pathname
                        .toLowerCase()
                        .includes("cart")
                ) {

                    window.location.href =
                        "login.html";

                }

                return [];

            }


            /* ==========================================
               SAFE RESPONSE
            ========================================== */

            const contentType =
                response.headers.get(
                    "content-type"
                ) || "";


            if (
                !contentType.includes(
                    "application/json"
                )
            ) {

                const text =
                    await response.text();

                console.error(
                    "❌ Cart API did not return JSON:",
                    text
                );

                throw new Error(
                    "Cart server response is invalid."
                );

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    "Unable to load cart."
                );

            }


            /* ==========================================
               SUPPORT MULTIPLE BACKEND FORMATS
            ========================================== */

            if (
                Array.isArray(
                    data?.items
                )
            ) {

                return data.items;

            }


            if (
                Array.isArray(
                    data?.cart
                )
            ) {

                return data.cart;

            }


            if (
                Array.isArray(
                    data?.cart?.items
                )
            ) {

                return data.cart.items;

            }


            if (
                Array.isArray(
                    data?.data
                )
            ) {

                return data.data;

            }


            return [];

        }

        catch (error) {

            console.error(
                "❌ Get Cart Error:",
                error
            );

            return [];

        }

    }


    /* =====================================================
       UPDATE CART HEADER COUNT
    ===================================================== */

    async function updateCartCount() {

        if (!cartCount) {
            return;
        }


        const token =
            getToken();


        if (!token) {

            cartCount.innerText =
                "0";

            return;

        }


        const items =
            await getCart();


        let total =
            0;


        items.forEach(
            item => {

                total +=
                    Number(
                        item?.quantity || 0
                    );

            }
        );


        cartCount.innerText =
            total;

    }


    /* =====================================================
       GET CART PRODUCT
    ===================================================== */

    function getCartProduct(item) {

        return (
            item?.product ||
            item?.productId ||
            item?.productData ||
            null
        );

    }


    /* =====================================================
       GET PRODUCT ID
    ===================================================== */

    function getProductId(
        item,
        product
    ) {

        if (
            product &&
            typeof product === "object"
        ) {

            return (
                product._id ||
                product.id ||
                item?.productId ||
                item?._id ||
                ""
            );

        }


        if (
            typeof product === "string"
        ) {

            return product;

        }


        return (
            item?.productId ||
            item?._id ||
            ""
        );

    }


    /* =====================================================
       GET PRODUCT IMAGE
    ===================================================== */

    function getProductImage(product) {

        if (!product) {
            return "";
        }


        if (product.image) {

            return getImageUrl(
                product.image
            );

        }


        if (
            Array.isArray(
                product.images
            ) &&
            product.images.length > 0
        ) {

            return getImageUrl(
                product.images[0]
            );

        }


        return "";

    }


    /* =====================================================
       PRICE
    ===================================================== */

    function getProductPrice(
        item,
        product
    ) {

        if (
            product &&
            typeof product === "object"
        ) {

            const price =
                Number(
                    product.price
                ) || 0;


            const discount =
                Number(
                    product.discount
                ) || 0;


            return discount > 0
                ? price -
                    (
                        price *
                        discount /
                        100
                    )
                : price;

        }


        return Number(
            item?.price ||
            item?.productPrice ||
            0
        );

    }


    /* =====================================================
       FORMAT PRICE
    ===================================================== */

    function formatPrice(value) {

        return Number(
            value || 0
        ).toLocaleString(
            "en-PK",
            {
                maximumFractionDigits: 0
            }
        );

    }


    /* =====================================================
       LOAD CART PAGE
    ===================================================== */

    async function loadCart() {

        /*
           IMPORTANT:

           cart.js is loaded on multiple pages.

           If this is NOT cart.html,
           don't try to render cart items.
        */

        if (!container) {

            /*
               No error.

               Product page, shop page etc.
               can safely use cart.js.
            */

            return;

        }


        const token =
            getToken();


        /* ==========================================
           LOGIN CHECK
        ========================================== */

        if (!token) {

            if (cartPage) {

                cartPage.style.display =
                    "none";

            }


            if (emptyCart) {

                emptyCart.style.display =
                    "none";

            }


            return;

        }


        try {

            const items =
                await getCart();


            container.innerHTML =
                "";


            /* ==========================================
               EMPTY CART
            ========================================== */

            if (
                !Array.isArray(items) ||
                items.length === 0
            ) {

                showEmptyCart();

                return;

            }


            /* ==========================================
               SHOW CART
            ========================================== */

            if (cartPage) {

                cartPage.style.display =
                    "block";

            }


            if (emptyCart) {

                emptyCart.style.display =
                    "none";

            }


            let subtotal =
                0;


            let totalItems =
                0;


            /* ==========================================
               RENDER CART ITEMS
            ========================================== */

            items.forEach(
                item => {

                    const product =
                        getCartProduct(
                            item
                        );


                    if (
                        !product ||
                        typeof product !== "object"
                    ) {

                        console.warn(
                            "⚠️ Product data missing:",
                            item
                        );

                        return;

                    }


                    const productId =
                        getProductId(
                            item,
                            product
                        );


                    if (!productId) {

                        console.warn(
                            "⚠️ Product ID missing:",
                            item
                        );

                        return;

                    }


                    const quantity =
                        Math.max(
                            1,
                            Number(
                                item?.quantity || 1
                            )
                        );


                    const price =
                        getProductPrice(
                            item,
                            product
                        );


                    const lineTotal =
                        price *
                        quantity;


                    subtotal +=
                        lineTotal;


                    totalItems +=
                        quantity;


                    const image =
                        getProductImage(
                            product
                        );


                    const productName =
                        product?.name ||
                        item?.name ||
                        "ZM LABEL Product";


                    const brand =
                        product?.brand ||
                        item?.brand ||
                        "ZM LABEL";


                    const color =
                        item?.color ||
                        "-";


                    const size =
                        item?.size ||
                        "-";


                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "cart-item";


                    card.innerHTML = `

                        <div class="cart-image">

                            ${
                                image
                                    ? `
                                        <img
                                            src="${escapeHTML(image)}"
                                            alt="${escapeHTML(productName)}"
                                            loading="lazy"
                                            onerror="
                                                this.style.display='none';
                                                this.parentElement.classList.add('image-error');
                                            "
                                        >
                                      `
                                    : `
                                        <div class="cart-no-image">
                                            ZM LABEL
                                        </div>
                                      `
                            }

                        </div>


                        <div class="cart-details">

                            <span class="cart-brand">
                                ${escapeHTML(brand)}
                            </span>

                            <h3>
                                ${escapeHTML(productName)}
                            </h3>

                            <p>
                                Size:
                                <strong>
                                    ${escapeHTML(size)}
                                </strong>
                            </p>

                            <p>
                                Color:
                                <strong>
                                    ${escapeHTML(color)}
                                </strong>
                            </p>

                            <h4>
                                Rs. ${formatPrice(price)}
                            </h4>

                        </div>


                        <div class="cart-actions">

                            <div class="quantity-box">

                                <button
                                    type="button"
                                    class="quantity-minus"
                                    data-product-id="${escapeHTML(productId)}"
                                    aria-label="Decrease quantity"
                                >
                                    −
                                </button>

                                <span>
                                    ${quantity}
                                </span>

                                <button
                                    type="button"
                                    class="quantity-plus"
                                    data-product-id="${escapeHTML(productId)}"
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>

                            </div>


                            <button
                                type="button"
                                class="delete-btn"
                                data-product-id="${escapeHTML(productId)}"
                                aria-label="Remove product"
                            >
                                <i class="ri-delete-bin-6-line"></i>
                            </button>

                        </div>

                    `;


                    /* ======================================
                       MINUS
                    ======================================= */

                    const minusButton =
                        card.querySelector(
                            ".quantity-minus"
                        );


                    minusButton?.addEventListener(
                        "click",
                        () => {

                            changeQuantity(
                                productId,
                                quantity - 1
                            );

                        }
                    );


                    /* ======================================
                       PLUS
                    ======================================= */

                    const plusButton =
                        card.querySelector(
                            ".quantity-plus"
                        );


                    plusButton?.addEventListener(
                        "click",
                        () => {

                            changeQuantity(
                                productId,
                                quantity + 1
                            );

                        }
                    );


                    /* ======================================
                       DELETE
                    ======================================= */

                    const deleteButton =
                        card.querySelector(
                            ".delete-btn"
                        );


                    deleteButton?.addEventListener(
                        "click",
                        () => {

                            removeItem(
                                productId
                            );

                        }
                    );


                    container.appendChild(
                        card
                    );

                }
            );


            /* ==========================================
               TOTALS
            ========================================== */

            if (itemCount) {

                itemCount.innerText =
                    totalItems;

            }


            if (subtotalElement) {

                subtotalElement.innerText =
                    `Rs.${formatPrice(subtotal)}`;

            }


            if (grandTotalElement) {

                grandTotalElement.innerText =
                    `Rs.${formatPrice(subtotal)}`;

            }


            if (cartCount) {

                cartCount.innerText =
                    totalItems;

            }

        }

        catch (error) {

            console.error(
                "❌ Load Cart Error:",
                error
            );

        }

    }


    /* =====================================================
       EMPTY CART
    ===================================================== */

    function showEmptyCart() {

        if (cartPage) {

            cartPage.style.display =
                "none";

        }


        if (emptyCart) {

            emptyCart.style.display =
                "block";

        }


        if (itemCount) {

            itemCount.innerText =
                "0";

        }


        if (subtotalElement) {

            subtotalElement.innerText =
                "Rs.0";

        }


        if (grandTotalElement) {

            grandTotalElement.innerText =
                "Rs.0";

        }


        if (cartCount) {

            cartCount.innerText =
                "0";

        }

    }


    /* =====================================================
       REMOVE ITEM
    ===================================================== */

    async function removeItem(productId) {

        if (!productId) {

            showCartMessage(
                "Product ID missing."
            );

            return;

        }


        const token =
            getToken();


        if (!token) {

            window.location.href =
                "login.html";

            return;

        }


        try {

            const response =
                await fetch(
                    `${CART_API}/${encodeURIComponent(
                        productId
                    )}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const contentType =
                response.headers.get(
                    "content-type"
                ) || "";


            let data = {};


            if (
                contentType.includes(
                    "application/json"
                )
            ) {

                data =
                    await response.json();

            }


            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    "Unable to remove product."
                );

            }


            await loadCart();

            await updateCartCount();

        }

        catch (error) {

            console.error(
                "❌ Remove Cart Item Error:",
                error
            );


            showCartMessage(
                error.message ||
                "Unable to remove product."
            );

        }

    }


    /* =====================================================
       CHANGE QUANTITY
    ===================================================== */

    async function changeQuantity(
        productId,
        newQuantity
    ) {

        if (!productId) {

            showCartMessage(
                "Product ID missing."
            );

            return;

        }


        if (
            Number(newQuantity) < 1
        ) {

            await removeItem(
                productId
            );

            return;

        }


        const token =
            getToken();


        if (!token) {

            window.location.href =
                "login.html";

            return;

        }


        try {

            const response =
                await fetch(
                    `${CART_API}/${encodeURIComponent(
                        productId
                    )}`,
                    {
                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({
                                quantity:
                                    Number(
                                        newQuantity
                                    )
                            })

                    }
                );


            const contentType =
                response.headers.get(
                    "content-type"
                ) || "";


            let data = {};


            if (
                contentType.includes(
                    "application/json"
                )
            ) {

                data =
                    await response.json();

            }


            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    "Unable to update quantity."
                );

            }


            await loadCart();

            await updateCartCount();

        }

        catch (error) {

            console.error(
                "❌ Quantity Update Error:",
                error
            );


            showCartMessage(
                error.message ||
                "Unable to update quantity."
            );

        }

    }


    /* =====================================================
       CHECKOUT
    ===================================================== */

    checkoutBtn?.addEventListener(
        "click",
        () => {

            const token =
                getToken();


            if (!token) {

                window.location.href =
                    "login.html";

                return;

            }


            window.location.href =
                "checkout.html";

        }
    );


    /* =====================================================
       TOAST
    ===================================================== */

    function showCartMessage(message) {

        let toast =
            document.getElementById(
                "cartToast"
            );


        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );


            toast.id =
                "cartToast";


            Object.assign(
                toast.style,
                {

                    position: "fixed",

                    right: "20px",

                    bottom: "20px",

                    zIndex: "99999",

                    padding: "14px 20px",

                    background: "#111111",

                    color: "#ffffff",

                    fontSize: "13px",

                    fontWeight: "600",

                    borderRadius: "4px",

                    boxShadow:
                        "0 10px 30px rgba(0,0,0,.18)"

                }
            );


            document.body.appendChild(
                toast
            );

        }


        toast.textContent =
            message;


        toast.style.display =
            "block";


        clearTimeout(
            toast.hideTimer
        );


        toast.hideTimer =
            setTimeout(
                () => {

                    toast.style.display =
                        "none";

                },
                2500
            );

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(
            value ?? ""
        )
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    /* =====================================================
       GLOBAL FUNCTIONS
    ===================================================== */

    window.updateCartCount =
        updateCartCount;

    window.loadCart =
        loadCart;

    window.removeItem =
        removeItem;

    window.changeQuantity =
        changeQuantity;


    /* =====================================================
       INITIALIZE
    ===================================================== */

    /*
       IMPORTANT:

       Do NOT call loadCart() on every page.

       Only cart.html contains #cartContainer.
    */

    if (container) {

        if (!getToken()) {

            if (cartPage) {

                cartPage.style.display =
                    "none";

            }


            if (emptyCart) {

                emptyCart.style.display =
                    "none";

            }

        }
        else {

            loadCart();

        }

    }


    /*
       Header cart badge works on
       product/shop/home pages too.
    */

    updateCartCount();

});