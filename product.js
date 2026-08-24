/* =========================================================
   ZM LABEL — PREMIUM PRODUCT PAGE
   PRODUCT.JS
   COMPLETE VERSION

   FIXED:
   ---------------------------------------------------------
   ✓ No duplicate API declaration
   ✓ No hard-coded localhost
   ✓ Correct backend image URLs
   ✓ Product loading
   ✓ Multiple product images
   ✓ Sizes
   ✓ Colors
   ✓ Quantity / stock limit
   ✓ Add to cart
   ✓ Buy now
   ✓ WhatsApp order
   ✓ Wishlist
   ✓ Related products
   ✓ Product tabs
   ✓ Premium review system
   ✓ ONLY 1 review initially
   ✓ View All Reviews button below reviews
   ✓ Show Less
   ✓ Review sorting
   ✓ Review image upload
   ✓ Review delete
   ✓ Review summary
   ✓ Rating breakdown
   ✓ Review form
========================================================= */


/* =========================================================
   API CONFIG
========================================================= */

/*
   IMPORTANT:
   Do NOT write:
   const API = ...

   main.js / config.js may already define API.

   We safely detect existing global config instead.
*/

const ZM_PRODUCT_API_ROOT = (() => {

    if (
        typeof window.ZM_API_BASE_URL === "string" &&
        window.ZM_API_BASE_URL.trim()
    ) {

        return window.ZM_API_BASE_URL
            .trim()
            .replace(/\/+$/, "");

    }


    if (
        typeof window.ZM_API_BASE === "string" &&
        window.ZM_API_BASE.trim()
    ) {

        return window.ZM_API_BASE
            .trim()
            .replace(/\/+$/, "");

    }


    /*
       If config.js already created API,
       use it without redeclaring it.
    */

    if (
        typeof window.API === "string" &&
        window.API.trim()
    ) {

        return window.API
            .trim()
            .replace(/\/+$/, "");

    }


    return "/api";

})();


/* =========================================================
   API ENDPOINTS
========================================================= */

const PRODUCT_API = `${ZM_PRODUCT_API_ROOT}/products`;

const REVIEW_API = `${ZM_PRODUCT_API_ROOT}/reviews`;

const CART_API = `${ZM_PRODUCT_API_ROOT}/cart`;

const WISHLIST_API = `${ZM_PRODUCT_API_ROOT}/wishlist`;


/* =========================================================
   IMAGE CONFIG
========================================================= */

const ZM_UPLOADS_ROOT = (() => {

    /*
       If backend API is:
       /api

       uploads should normally be:
       /uploads/

       If API is:
       https://domain.com/api

       uploads becomes:
       https://domain.com/uploads/
    */

    if (
        typeof window.ZM_UPLOADS_URL === "string" &&
        window.ZM_UPLOADS_URL.trim()
    ) {

        return window.ZM_UPLOADS_URL
            .trim()
            .replace(/\/+$/, "") + "/";

    }


    let apiRoot =
        ZM_PRODUCT_API_ROOT
            .replace(/\/+$/, "");


    /*
       Absolute API URL
    */

    if (
        /^https?:\/\//i.test(apiRoot)
    ) {

        apiRoot = apiRoot.replace(
            /\/api$/i,
            ""
        );

        return `${apiRoot}/uploads/`;

    }


    /*
       Relative API
    */

    return "/uploads/";

})();


const NO_IMAGE =
    "images/no-image.png";


/* =========================================================
   PRODUCT ID
========================================================= */

const productId =
    new URLSearchParams(
        window.location.search
    ).get("id");


/* =========================================================
   GLOBAL PRODUCT STATE
========================================================= */

let product = null;

let quantity = 1;


/* =========================================================
   REVIEW STATE
========================================================= */

let allProductReviews = [];

let showAllReviews = false;

let reviewSortMode = "newest";


/* =========================================================
   DOM ELEMENTS
========================================================= */

const mainImage =
    document.getElementById(
        "mainProductImage"
    );


const thumbnailGallery =
    document.getElementById(
        "thumbnailGallery"
    );


const breadcrumbName =
    document.getElementById(
        "breadcrumbName"
    );


const productBadge =
    document.getElementById(
        "productBadge"
    );


const productName =
    document.getElementById(
        "productName"
    );


const productPrice =
    document.getElementById(
        "productPrice"
    );


const oldPrice =
    document.getElementById(
        "oldPrice"
    );


const discountBadge =
    document.getElementById(
        "discountBadge"
    );


const stockStatus =
    document.getElementById(
        "stockStatus"
    );


const productDescription =
    document.getElementById(
        "productDescription"
    );


const productDescriptionTab =
    document.getElementById(
        "productDescriptionTab"
    );


const sizesContainer =
    document.getElementById(
        "sizesContainer"
    );


const colorsContainer =
    document.getElementById(
        "colorsContainer"
    );


const selectedSize =
    document.getElementById(
        "selectedSize"
    );


const selectedColor =
    document.getElementById(
        "selectedColor"
    );


const qtyInput =
    document.getElementById(
        "productQty"
    );


const relatedProducts =
    document.getElementById(
        "relatedProducts"
    );


/* =========================================================
   REVIEW DOM
========================================================= */

const reviewForm =
    document.getElementById(
        "reviewForm"
    );


const reviewFormWrapper =
    document.getElementById(
        "reviewFormWrapper"
    );


const reviewNameInput =
    document.getElementById(
        "reviewName"
    );


const reviewRatingInput =
    document.getElementById(
        "reviewRating"
    );


const reviewCommentInput =
    document.getElementById(
        "reviewComment"
    );


const reviewImagesInput =
    document.getElementById(
        "reviewImages"
    );


const reviewsList =
    document.getElementById(
        "reviewsList"
    );


const reviewsEmpty =
    document.getElementById(
        "reviewsEmpty"
    );


const reviewSort =
    document.getElementById(
        "reviewSort"
    );


const reviewCount =
    document.getElementById(
        "reviewCount"
    );


const averageRating =
    document.getElementById(
        "averageRating"
    );


const averageStars =
    document.getElementById(
        "averageStars"
    );


const rating5Bar =
    document.getElementById(
        "rating5Bar"
    );


const rating4Bar =
    document.getElementById(
        "rating4Bar"
    );


const rating3Bar =
    document.getElementById(
        "rating3Bar"
    );


const rating2Bar =
    document.getElementById(
        "rating2Bar"
    );


const rating1Bar =
    document.getElementById(
        "rating1Bar"
    );


const rating5Count =
    document.getElementById(
        "rating5Count"
    );


const rating4Count =
    document.getElementById(
        "rating4Count"
    );


const rating3Count =
    document.getElementById(
        "rating3Count"
    );


const rating2Count =
    document.getElementById(
        "rating2Count"
    );


const rating1Count =
    document.getElementById(
        "rating1Count"
    );


const reviewsCountLabel =
    document.getElementById(
        "reviewsCountLabel"
    );


const reviewCharCount =
    document.getElementById(
        "reviewCharCount"
    );


/* =========================================================
   SMALL HELPERS
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   IMAGE URL BUILDER
========================================================= */

function getImageUrl(image) {

    if (!image) {
        return NO_IMAGE;
    }


    /*
       If backend returns complete URL
    */

    if (
        /^https?:\/\//i.test(
            String(image)
        )
    ) {

        return String(image);

    }


    let cleanImage =
        String(image)
            .trim()
            .replace(/^\/+/, "");


    /*
       Already contains uploads/
    */

    cleanImage =
        cleanImage.replace(
            /^uploads\//i,
            ""
        );


    /*
       Remove accidental Frontend/
    */

    cleanImage =
        cleanImage.replace(
            /^Frontend\//i,
            ""
        );


    return `${ZM_UPLOADS_ROOT}${cleanImage}`;

}


/* =========================================================
   IMAGE ERROR HANDLER
========================================================= */

function handleImageError(image) {

    if (!image) {
        return;
    }

    image.onerror = null;

    image.src = NO_IMAGE;

}


/* =========================================================
   GET LOGGED IN USER
========================================================= */

function getLoggedInUser() {

    try {

        const keys = [
            "user",
            "currentUser",
            "loggedInUser"
        ];


        for (
            const key of keys
        ) {

            const saved =
                localStorage.getItem(
                    key
                );


            if (!saved) {
                continue;
            }


            try {

                const parsed =
                    JSON.parse(saved);


                if (parsed) {
                    return parsed;
                }

            }
            catch {

                return {
                    name: saved
                };

            }

        }

    }
    catch (error) {

        console.error(
            "USER LOAD ERROR:",
            error
        );

    }


    return null;

}


/* =========================================================
   LOAD PRODUCT
========================================================= */

async function loadProduct() {

    if (!productId) {

        showProductError(
            "Invalid Product",
            "No product ID was found."
        );

        return;

    }


    try {

        const response =
            await fetch(
                `${PRODUCT_API}/${encodeURIComponent(productId)}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success ||
            !data.product
        ) {

            showProductError(
                "Product Not Found",
                "This product may have been removed."
            );

            return;

        }


        product =
            data.product;


        renderProduct();

        loadRelatedProducts();

        loadProductReviews();

    }
    catch (error) {

        console.error(
            "LOAD PRODUCT ERROR:",
            error
        );


        showProductError(
            "Server Error",
            "Unable to load this product right now."
        );

    }

}


/* =========================================================
   PRODUCT ERROR
========================================================= */

function showProductError(
    title,
    message
) {

    const wrapper =
        document.querySelector(
            ".product-wrapper"
        );


    if (!wrapper) {
        return;
    }


    wrapper.innerHTML = `

        <div class="product-error">

            <i class="ri-error-warning-line"></i>

            <h2>
                ${escapeHTML(title)}
            </h2>

            <p>
                ${escapeHTML(message)}
            </p>

            <a href="shop.html">
                Continue Shopping
            </a>

        </div>

    `;

}


/* =========================================================
   RENDER PRODUCT
========================================================= */

function renderProduct() {

    if (!product) {
        return;
    }


    if (breadcrumbName) {

        breadcrumbName.textContent =
            product.name || "Product";

    }


    if (productName) {

        productName.textContent =
            product.name || "Product";

    }


    if (productDescription) {

        productDescription.textContent =
            product.description || "";

    }


    if (productDescriptionTab) {

        productDescriptionTab.textContent =
            product.description || "";

    }


    /* =====================================================
       PRICE
    ===================================================== */

    const price =
        Number(product.price) || 0;


    const discount =
        Number(product.discount) || 0;


    if (productPrice) {

        productPrice.textContent =
            formatPrice(price);

    }


    if (
        oldPrice &&
        discountBadge
    ) {

        if (discount > 0) {

            const old =
                Math.round(
                    price /
                    (1 - discount / 100)
                );


            oldPrice.textContent =
                formatPrice(old);


            discountBadge.textContent =
                `-${discount}%`;


            oldPrice.style.display =
                "inline-block";


            discountBadge.style.display =
                "inline-flex";

        }
        else {

            oldPrice.style.display =
                "none";


            discountBadge.style.display =
                "none";

        }

    }


    /* =====================================================
       PRODUCT BADGE
    ===================================================== */

    if (productBadge) {

        if (product.badge) {

            productBadge.innerHTML = `

                <span class="product-badge">
                    ${escapeHTML(product.badge)}
                </span>

            `;

        }
        else {

            productBadge.innerHTML = "";

        }

    }


    /* =====================================================
       STOCK
    ===================================================== */

    updateStockUI();


    /* =====================================================
       IMAGES
    ===================================================== */

    renderProductImages();


    /* =====================================================
       OPTIONS
    ===================================================== */

    renderSizes();

    renderColors();


    /* =====================================================
       QUANTITY
    ===================================================== */

    quantity = 1;

    if (qtyInput) {
        qtyInput.value = "1";
    }

}


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(value) {

    const number =
        Number(value) || 0;


    return `Rs. ${number.toLocaleString("en-PK")}`;

}


/* =========================================================
   STOCK UI
========================================================= */

function updateStockUI() {

    if (!stockStatus || !product) {
        return;
    }


    const stock =
        Number(product.stock) || 0;


    if (stock > 0) {

        stockStatus.innerHTML = `

            <span class="stock-dot"></span>

            In Stock

        `;

        stockStatus.classList.remove(
            "out-of-stock"
        );

        stockStatus.classList.add(
            "in-stock"
        );

    }
    else {

        stockStatus.innerHTML = `

            <span class="stock-dot"></span>

            Out Of Stock

        `;

        stockStatus.classList.remove(
            "in-stock"
        );

        stockStatus.classList.add(
            "out-of-stock"
        );

    }

}


/* =========================================================
   PRODUCT IMAGES
========================================================= */
/* =========================================================
   GET ALL PRODUCT IMAGES
========================================================= */

function getProductImages() {

    const images = [];

    /* =====================================================
       HELPER
    ===================================================== */

    function addImage(image) {

        if (!image) {
            return;
        }

        let value = image;

        /* Object image */

        if (typeof image === "object") {

            value =
                image.url ||
                image.path ||
                image.filename ||
                image.fileName ||
                image.image ||
                image.src ||
                image.name;

        }

        /* String image */

        if (typeof value !== "string") {
            return;
        }

        value = value.trim();

        if (!value) {
            return;
        }

        /* Avoid duplicate images */

        if (!images.includes(value)) {

            images.push(value);

        }

    }


    /* =====================================================
       MAIN IMAGE
    ===================================================== */

    addImage(product?.image);


    /* =====================================================
       MULTIPLE IMAGES
    ===================================================== */

    const possibleArrays = [

        product?.images,

        product?.productImages,

        product?.gallery,

        product?.imageGallery,

        product?.photos

    ];


    possibleArrays.forEach(list => {

        if (!Array.isArray(list)) {
            return;
        }

        list.forEach(image => {

            addImage(image);

        });

    });


    /* =====================================================
       RETURN
    ===================================================== */

    console.log(
        "PRODUCT IMAGES:",
        images
    );

    return images;

}



/* =========================================================
   RENDER PRODUCT IMAGES
========================================================= */

function renderProductImages() {

    if (
        !mainImage ||
        !thumbnailGallery
    ) {

        console.warn(
            "Product gallery elements not found."
        );

        return;

    }


    /* =====================================================
       GET IMAGES
    ===================================================== */

    const images =
        getProductImages();


    console.log(
        "Rendering Product Images:",
        images
    );


    /* =====================================================
       NO IMAGE
    ===================================================== */

    if (!images.length) {

        mainImage.src =
            NO_IMAGE;

        mainImage.alt =
            "ZM LABEL Product";

        thumbnailGallery.innerHTML =
            "";

        return;

    }


    /* =====================================================
       BUILD IMAGE URLS
    ===================================================== */

    const imageURLs =
        images
            .map(image => {

                try {

                    return getImageUrl(image);

                }

                catch (error) {

                    console.error(
                        "Image URL Error:",
                        image,
                        error
                    );

                    return null;

                }

            })
            .filter(Boolean);


    if (!imageURLs.length) {

        mainImage.src =
            NO_IMAGE;

        thumbnailGallery.innerHTML =
            "";

        return;

    }


    /* =====================================================
       MAIN IMAGE
    ===================================================== */

    mainImage.src =
        imageURLs[0];

    mainImage.alt =
        product?.name ||
        "ZM LABEL Product";


    mainImage.onerror =
        function () {

            handleImageError(
                this
            );

        };


    /* =====================================================
       CLEAR THUMBNAILS
    ===================================================== */

    thumbnailGallery.innerHTML =
        "";


    /* =====================================================
       CREATE THUMBNAILS
    ===================================================== */

    imageURLs.forEach(
        (url, index) => {

            const thumb =
                document.createElement(
                    "img"
                );


            thumb.src =
                url;


            thumb.alt =
                `${product?.name || "Product"} ${index + 1}`;


            thumb.loading =
                "lazy";


            thumb.className =
                "product-thumbnail";


            /* =================================================
               FIRST IMAGE ACTIVE
            ================================================= */

            if (index === 0) {

                thumb.classList.add(
                    "active"
                );

            }


            /* =================================================
               IMAGE ERROR
            ================================================= */

            thumb.onerror =
                function () {

                    handleImageError(
                        this
                    );

                };


            /* =================================================
               CLICK THUMBNAIL
            ================================================= */

            thumb.addEventListener(
                "click",
                function () {

                    mainImage.src =
                        url;


                    mainImage.alt =
                        `${product?.name || "Product"} ${index + 1}`;


                    /* Remove active */

                    thumbnailGallery
                        .querySelectorAll("img")
                        .forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    /* Add active */

                    this.classList.add(
                        "active"
                    );

                }
            );


            /* =================================================
               ADD THUMBNAIL
            ================================================= */

            thumbnailGallery.appendChild(
                thumb
            );

        }
    );

}
/* =========================================================
   RENDER SIZES
========================================================= */

function renderSizes() {

    if (!sizesContainer) {
        return;
    }


    sizesContainer.innerHTML =
        "";


    const sizes =
        Array.isArray(product?.sizes)
            ? product.sizes
            : [];


    if (!sizes.length) {

        sizesContainer.innerHTML = `

            <p class="no-option">
                No Size Available
            </p>

        `;

        if (selectedSize) {

            selectedSize.textContent =
                "No Size Available";

        }

        return;

    }


    sizes.forEach(
        (size, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "size-btn";


            button.textContent =
                String(size);


            button.dataset.size =
                String(size);


            if (index === 0) {

                button.classList.add(
                    "active"
                );


                if (selectedSize) {

                    selectedSize.textContent =
                        `Selected: ${size}`;

                }

            }


            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            "#sizesContainer .size-btn"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );


                    if (selectedSize) {

                        selectedSize.textContent =
                            `Selected: ${size}`;

                    }

                }
            );


            sizesContainer.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   COLOR DISPLAY
========================================================= */

function getColorValue(color) {

    const value =
        String(color || "")
            .trim();


    const knownColors = {

        black: "#111111",

        white: "#ffffff",

        red: "#d71920",

        blue: "#1e4f9a",

        navy: "#0b1f3a",

        "navy blue": "#0b1f3a",

        green: "#24723c",

        olive: "#66734f",

        grey: "#888888",

        gray: "#888888",

        brown: "#795548",

        beige: "#d8c3a5",

        cream: "#f4ead5",

        yellow: "#e2c200",

        orange: "#e67e22",

        pink: "#e8a0b8",

        purple: "#7046a5",

        maroon: "#721c24"

    };


    return (
        knownColors[
            value.toLowerCase()
        ] ||
        value
    );

}


/* =========================================================
   RENDER COLORS
========================================================= */

function renderColors() {

    if (!colorsContainer) {
        return;
    }


    colorsContainer.innerHTML =
        "";


    const colors =
        Array.isArray(product?.colors)
            ? product.colors
            : [];


    if (!colors.length) {

        colorsContainer.innerHTML = `

            <p class="no-option">
                No Color Available
            </p>

        `;

        if (selectedColor) {

            selectedColor.textContent =
                "No Color Available";

        }

        return;

    }


    colors.forEach(
        (color, index) => {

            const circle =
                document.createElement(
                    "button"
                );


            circle.type =
                "button";


            circle.className =
                "color-circle";


            circle.dataset.color =
                String(color);


            circle.title =
                String(color);


            circle.setAttribute(
                "aria-label",
                `Select ${color}`
            );


            circle.style.background =
                getColorValue(color);


            if (
                String(color)
                    .toLowerCase()
                    === "white"
            ) {

                circle.style.border =
                    "1px solid #d8d8d8";

            }


            if (index === 0) {

                circle.classList.add(
                    "active"
                );


                if (selectedColor) {

                    selectedColor.textContent =
                        `Selected: ${color}`;

                }

            }


            circle.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            "#colorsContainer .color-circle"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    circle.classList.add(
                        "active"
                    );


                    if (selectedColor) {

                        selectedColor.textContent =
                            `Selected: ${color}`;

                    }

                }
            );


            colorsContainer.appendChild(
                circle
            );

        }
    );

}


/* =========================================================
   QUANTITY
========================================================= */

function setQuantity(
    value
) {

    if (!product) {
        return;
    }


    const stock =
        Number(product.stock) || 0;


    let next =
        Number(value) || 1;


    next =
        Math.max(
            1,
            next
        );


    if (stock > 0) {

        next =
            Math.min(
                next,
                stock
            );

    }


    quantity =
        next;


    if (qtyInput) {

        qtyInput.value =
            String(quantity);

    }

}


/* =========================================================
   PLUS / MINUS
========================================================= */

document
    .getElementById("plusQty")
    ?.addEventListener(
        "click",
        () => {

            setQuantity(
                quantity + 1
            );

        }
    );


document
    .getElementById("minusQty")
    ?.addEventListener(
        "click",
        () => {

            if (quantity > 1) {

                setQuantity(
                    quantity - 1
                );

            }

        }
    );


/* =========================================================
   GET SELECTED OPTIONS
========================================================= */

function getSelectedOptions() {

    const sizeElement =
        document.querySelector(
            "#sizesContainer .size-btn.active"
        );


    const colorElement =
        document.querySelector(
            "#colorsContainer .color-circle.active"
        );


    return {

        size:
            sizeElement
                ? sizeElement.dataset.size ||
                  sizeElement.textContent.trim()
                : "",

        color:
            colorElement
                ? colorElement.dataset.color || ""
                : ""

    };

}


/* =========================================================
   ADD TO CART BUTTON
========================================================= */

document
    .getElementById("addToCart")
    ?.addEventListener(
        "click",
        async () => {

            if (!product) {
                return;
            }


            if (
                Number(product.stock) <= 0
            ) {

                showAlert(
                    "warning",
                    "Out Of Stock",
                    "This product is currently unavailable."
                );

                return;

            }


            const options =
                getSelectedOptions();


            const cartProduct = {

                productId:
                    product._id,

                quantity:
                    Number(quantity),

                size:
                    options.size,

                color:
                    options.color

            };


            await addToCart(
                cartProduct
            );

        }
    );


/* =========================================================
   ADD TO CART
========================================================= */

async function addToCart(
    cartProduct
) {

    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        window.location.href =
            "login.html";

        return;

    }


    try {

        const response =
            await fetch(
                `${CART_API}/add`,
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
                        JSON.stringify(
                            cartProduct
                        )

                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "Unable to add product to cart."
            );

        }


        showAlert(
            "success",
            "Added To Cart",
            "Product added successfully."
        );


        if (
            typeof window.updateCartCount ===
            "function"
        ) {

            window.updateCartCount();

        }

    }
    catch (error) {

        console.error(
            "ADD CART ERROR:",
            error
        );


        showAlert(
            "error",
            "Failed",
            error.message ||
            "Unable to add product to cart."
        );

    }

}


/* =========================================================
   BUY NOW
========================================================= */

document
    .getElementById("buyNow")
    ?.addEventListener(
        "click",
        () => {

            if (!product) {
                return;
            }


            if (
                Number(product.stock) <= 0
            ) {

                showAlert(
                    "warning",
                    "Out Of Stock",
                    "This product is currently unavailable."
                );

                return;

            }


            const options =
                getSelectedOptions();


            const checkoutData = {

                productId:
                    product._id,

                name:
                    product.name,

                price:
                    product.price,

                image:
                    product.image,

                quantity:
                    Number(quantity),

                size:
                    options.size,

                color:
                    options.color

            };


            localStorage.setItem(
                "buyNowProduct",
                JSON.stringify(
                    checkoutData
                )
            );


            window.location.href =
                "checkout.html";

        }
    );


/* =========================================================
   WHATSAPP ORDER
========================================================= */

function orderWhatsApp() {

    if (!product) {
        return;
    }


    const options =
        getSelectedOptions();


    const text = `Hello ZM LABEL 👋

I want to order:

Product : ${product.name}

Price : Rs. ${product.price}

Size : ${options.size || "-"}

Color : ${options.color || "-"}

Quantity : ${quantity}`;


    window.open(
        `https://wa.me/923116342109?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener"
    );

}


window.orderWhatsApp =
    orderWhatsApp;


/* =========================================================
   WISHLIST
========================================================= */

async function toggleWishlist(
    event,
    selectedProductId
) {

    if (event) {
        event.stopPropagation();
    }


    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        window.location.href =
            "login.html";

        return;

    }


    try {

        const response =
            await fetch(
                WISHLIST_API,
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
                                selectedProductId
                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to update wishlist."
            );

        }


        if (event?.currentTarget) {

            event.currentTarget
                .classList.toggle(
                    "active"
                );

        }


        if (
            typeof window.updateWishlistCount ===
            "function"
        ) {

            window.updateWishlistCount();

        }


        showAlert(
            "success",
            "Wishlist Updated",
            "",
            1000
        );

    }
    catch (error) {

        console.error(
            "WISHLIST ERROR:",
            error
        );


        showAlert(
            "error",
            "Wishlist Error",
            error.message
        );

    }

}


window.toggleWishlist =
    toggleWishlist;


/* =========================================================
   PRODUCT TABS
========================================================= */

function setupProductTabs() {

    const buttons =
        document.querySelectorAll(
            ".tab-btn"
        );


    const contents =
        document.querySelectorAll(
            ".tab-content"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    buttons.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    contents.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    const target =
                        document.getElementById(
                            button.dataset.tab
                        );


                    if (target) {

                        target.classList.add(
                            "active"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   RELATED PRODUCTS
   SAME LOGIC AS YOUR CURRENT VERSION
========================================================= */

async function loadRelatedProducts() {

    if (!relatedProducts || !product) {
        return;
    }


    try {

        const response =
            await fetch(
                PRODUCT_API
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {
            return;
        }


        relatedProducts.innerHTML =
            "";


        const items =
            (Array.isArray(data.products)
                ? data.products
                : []
            )
                .filter(
                    item =>

                        item.category ===
                        product.category &&

                        item._id !==
                        product._id &&

                        item.status ===
                        "Active"
                )
                .slice(
                    0,
                    4
                );


        if (!items.length) {

            relatedProducts.innerHTML = `

                <p class="no-related-products">
                    No Related Products Found.
                </p>

            `;

            return;

        }


       items.forEach(
    item => {

        const image =
            getImageUrl(
                item.image
            );


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "related-card";


        /* =====================================================
           RELATED PRODUCT PRICE
        ===================================================== */

        const price =
            Number(item.price) || 0;


        const discount =
            Number(item.discount) || 0;


        let priceHTML = `

            <div class="related-price-row">

                <span class="related-current-price">
                    ${formatPrice(price)}
                </span>

        `;


        /*
           Show old price + discount
           only when discount exists.
        */

        if (discount > 0 && discount < 100) {

            const oldPriceValue =
                Math.round(
                    price /
                    (1 - discount / 100)
                );


            priceHTML += `

                <span class="related-old-price">
                    ${formatPrice(oldPriceValue)}
                </span>

                <span class="related-discount">
                    -${discount}%
                </span>

            `;

        }


        priceHTML += `

            </div>

        `;


        card.innerHTML = `

            <a
                href="product.html?id=${encodeURIComponent(item._id)}"
                class="related-image-link"
            >

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(item.name)}"
                    loading="lazy"
                >

            </a>


            <div class="related-info">

                <h3>
                    ${escapeHTML(item.name)}
                </h3>


                ${priceHTML}


                <a
                    href="product.html?id=${encodeURIComponent(item._id)}"
                >
                    View Product
                </a>

            </div>

        `;


        const imageElement =
            card.querySelector(
                "img"
            );


        if (imageElement) {

            imageElement.onerror =
                () =>
                    handleImageError(
                        imageElement
                    );

        }


        relatedProducts.appendChild(
            card
        );

    }
);

            
    

    }
    catch (error) {

        console.error(
            "RELATED PRODUCTS ERROR:",
            error
        );

    }

}


/* =========================================================
   SWEETALERT HELPER
========================================================= */

function showAlert(
    icon,
    title,
    text = "",
    timer = null
) {

    if (
        typeof window.Swal ===
        "undefined"
    ) {

        alert(
            text
                ? `${title}\n${text}`
                : title
        );

        return;

    }


    const options = {

        icon,
        title,

        text,

        confirmButtonColor:
            "#111111"

    };


    if (timer) {

        options.timer =
            timer;

        options.showConfirmButton =
            false;

    }


    window.Swal.fire(
        options
    );

}


/* =========================================================
   REVIEW — GET PRODUCT ID
========================================================= */

function getReviewProductId() {

    return productId;

}


/* =========================================================
   REVIEW — STAR HTML
========================================================= */

function getReviewStars(
    rating
) {

    const value =
        Math.max(
            0,
            Math.min(
                5,
                Number(rating) || 0
            )
        );


    let html = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        html +=
            i <= value
                ? `<i class="ri-star-fill"></i>`
                : `<i class="ri-star-line"></i>`;

    }


    return html;

}


/* =========================================================
   REVIEW — LOAD
========================================================= */

async function loadProductReviews() {

    if (!productId) {
        return;
    }


    try {

        const response =
            await fetch(
                `${REVIEW_API}/product/${encodeURIComponent(productId)}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            console.warn(
                "REVIEW LOAD FAILED:",
                data.message || data
            );

            renderReviewEmpty();

            return;

        }


        allProductReviews =
            Array.isArray(data.reviews)
                ? data.reviews
                : [];


        renderReviewSummary(
            data
        );


        /*
           IMPORTANT:
           Every time reviews load,
           default state is ONE review.
        */

        renderReviews();

    }
    catch (error) {

        console.error(
            "LOAD REVIEWS ERROR:",
            error
        );

        renderReviewEmpty();

    }

}


/* =========================================================
   REVIEW — SUMMARY
========================================================= */

function renderReviewSummary(
    data
) {

    const count =
        Number(
            data.reviewCount ??
            allProductReviews.length ??
            0
        );


    const average =
        Number(
            data.averageRating ??
            calculateAverageRating()
        );


    if (averageRating) {

        averageRating.textContent =
            average.toFixed(1);

    }


    if (averageStars) {

        averageStars.innerHTML =
            getReviewStars(
                Math.round(average)
            );

    }


    if (reviewCount) {

        reviewCount.textContent =
            `${count} Review${count === 1 ? "" : "s"}`;

    }


    if (reviewsCountLabel) {

        reviewsCountLabel.textContent =
            `${count} review${count === 1 ? "" : "s"}`;

    }


    const breakdown =
        data.ratingBreakdown ||
        calculateRatingBreakdown();


    updateRatingRow(
        5,
        breakdown[5] || 0,
        count
    );


    updateRatingRow(
        4,
        breakdown[4] || 0,
        count
    );


    updateRatingRow(
        3,
        breakdown[3] || 0,
        count
    );


    updateRatingRow(
        2,
        breakdown[2] || 0,
        count
    );


    updateRatingRow(
        1,
        breakdown[1] || 0,
        count
    );

}


/* =========================================================
   REVIEW — CALCULATE AVERAGE
========================================================= */

function calculateAverageRating() {

    if (!allProductReviews.length) {
        return 0;
    }


    const total =
        allProductReviews.reduce(
            (
                sum,
                review
            ) =>
                sum +
                (
                    Number(
                        review.rating
                    ) || 0
                ),
            0
        );


    return (
        total /
        allProductReviews.length
    );

}


/* =========================================================
   REVIEW — BREAKDOWN
========================================================= */

function calculateRatingBreakdown() {

    const breakdown = {

        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0

    };


    allProductReviews.forEach(
        review => {

            const rating =
                Number(
                    review.rating
                );


            if (
                rating >= 1 &&
                rating <= 5
            ) {

                breakdown[rating]++;

            }

        }
    );


    return breakdown;

}


/* =========================================================
   REVIEW — UPDATE RATING ROW
========================================================= */

function updateRatingRow(
    rating,
    total,
    reviewTotal
) {

    const percentage =
        reviewTotal > 0
            ? Math.round(
                (
                    total /
                    reviewTotal
                ) * 100
            )
            : 0;


    const bar =
        document.getElementById(
            `rating${rating}Bar`
        );


    const count =
        document.getElementById(
            `rating${rating}Count`
        );


    if (bar) {

        bar.style.width =
            `${percentage}%`;

    }


    if (count) {

        count.textContent =
            total;

    }

}


/* =========================================================
   REVIEW — SORT
========================================================= */

function getSortedReviews() {

    const reviews =
        [...allProductReviews];


    if (
        reviewSortMode ===
        "highest"
    ) {

        return reviews.sort(
            (a, b) =>
                Number(b.rating || 0) -
                Number(a.rating || 0)
        );

    }


    if (
        reviewSortMode ===
        "lowest"
    ) {

        return reviews.sort(
            (a, b) =>
                Number(a.rating || 0) -
                Number(b.rating || 0)
        );

    }


    return reviews.sort(
        (a, b) =>
            new Date(
                b.createdAt || 0
            ) -
            new Date(
                a.createdAt || 0
            )
    );

}


/* =========================================================
   REVIEW — RENDER
========================================================= */

function renderReviews() {

    if (!reviewsList) {
        return;
    }


    if (!allProductReviews.length) {

        renderReviewEmpty();

        return;

    }


    if (reviewsEmpty) {

        reviewsEmpty.hidden =
            true;

    }


    const sortedReviews =
        getSortedReviews();


    /*
       PREMIUM BEHAVIOR:
       ONLY ONE REVIEW BY DEFAULT.

       View All button opens all.
    */

    const reviewsToShow =
        showAllReviews
            ? sortedReviews
            : sortedReviews.slice(
                0,
                1
            );


    reviewsList.innerHTML =
        reviewsToShow
            .map(
                renderSingleReview
            )
            .join("");


    setupReviewDeleteButtons();

    updateViewAllButton();

}


/* =========================================================
   REVIEW — EMPTY
========================================================= */

function renderReviewEmpty() {

    if (reviewsList) {

        reviewsList.innerHTML =
            "";

    }


    if (reviewsEmpty) {

        reviewsEmpty.hidden =
            false;

    }

}


/* =========================================================
   REVIEW — SINGLE REVIEW
========================================================= */

function renderSingleReview(
    review
) {

    if (!review) {
        return "";
    }


    const user =
        review.user || {};


    const name =
        review.name ||
        user.name ||
        "Customer";


    const rating =
        Number(
            review.rating
        ) || 0;


    const comment =
        review.comment ||
        review.text ||
        "";


    const date =
        review.createdAt
            ? formatReviewDate(
                review.createdAt
            )
            : "";


    const currentUser =
        getLoggedInUser();


    const currentUserId =
        currentUser?._id ||
        currentUser?.id ||
        "";


    const reviewUserId =
        typeof review.user ===
        "object"
            ? review.user?._id
            : review.user;


    let deleteHTML = "";


    if (
        currentUserId &&
        reviewUserId &&
        String(currentUserId) ===
        String(reviewUserId)
    ) {

        deleteHTML = `

            <button
                type="button"
                class="delete-review-btn"
                data-review-id="${escapeHTML(review._id || "")}"
                aria-label="Delete Review"
                title="Delete Review"
            >

                <i class="ri-delete-bin-line"></i>

            </button>

        `;

    }


    let imagesHTML = "";


    if (
        Array.isArray(
            review.images
        ) &&
        review.images.length
    ) {

        imagesHTML = `

            <div class="review-images">

                ${review.images
                    .slice(0, 5)
                    .map(
                        image => {

                            const url =
                                getImageUrl(
                                    image
                                );


                            return `

                                <a
                                    href="${escapeHTML(url)}"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >

                                    <img
                                        src="${escapeHTML(url)}"
                                        alt="Customer review image"
                                        loading="lazy"
                                        onerror="this.style.display='none'"
                                    >

                                </a>

                            `;

                        }
                    )
                    .join("")}

            </div>

        `;

    }


    const firstLetter =
        String(name)
            .trim()
            .charAt(0)
            .toUpperCase() ||
        "C";


    return `

        <article
            class="single-review"
            data-review-id="${escapeHTML(review._id || "")}"
        >

            <div class="review-top">

                <div class="review-user">

                    <div class="review-avatar">
                        ${escapeHTML(firstLetter)}
                    </div>


                    <div class="review-user-info">

                        <h4>
                            ${escapeHTML(name)}
                        </h4>


                        <div class="review-meta">

                            <div class="review-stars">
                                ${getReviewStars(rating)}
                            </div>

                            ${
                                date
                                    ? `
                                        <span class="review-date">
                                            ${escapeHTML(date)}
                                        </span>
                                      `
                                    : ""
                            }

                        </div>

                    </div>

                </div>


                ${deleteHTML}

            </div>


            <div class="review-content">

                <p>
                    ${escapeHTML(comment)}
                </p>

            </div>


            ${imagesHTML}

        </article>

    `;

}


/* =========================================================
   REVIEW — DATE
========================================================= */

function formatReviewDate(
    date
) {

    try {

        return new Date(
            date
        ).toLocaleDateString(
            "en-PK",
            {
                day:
                    "numeric",

                month:
                    "short",

                year:
                    "numeric"
            }
        );

    }
    catch {

        return "";

    }

}


/* =========================================================
   REVIEW — VIEW ALL BUTTON
========================================================= */

function updateViewAllButton() {

    /*
       Remove previously generated
       buttons so only ONE exists.
    */

    document
        .querySelectorAll(
            ".view-all-reviews-btn"
        )
        .forEach(
            button =>
                button.remove()
        );


    if (
        allProductReviews.length <= 1
    ) {

        return;

    }


    if (!reviewsList) {
        return;
    }


    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";


    button.className =
        "view-all-reviews-btn";


    button.innerHTML =
        showAllReviews
            ? `
                Show Less
                <i class="ri-arrow-up-line"></i>
              `
            : `
                View All Reviews
                <i class="ri-arrow-down-line"></i>
              `;


    button.addEventListener(
        "click",
        () => {

            showAllReviews =
                !showAllReviews;


            renderReviews();


            /*
               Scroll only when opening all.
            */

            if (
                showAllReviews
            ) {

                setTimeout(
                    () => {

                        button.scrollIntoView({
                            behavior:
                                "smooth",

                            block:
                                "center"
                        });

                    },
                    80
                );

            }

        }
    );


    /*
       EXACTLY ONE button
       directly below reviews.
    */

    reviewsList.insertAdjacentElement(
        "afterend",
        button
    );

}


/* =========================================================
   REVIEW — RATING SELECTOR
========================================================= */

function setupReviewRating() {

    const stars =
        document.querySelectorAll(
            ".review-star"
        );


    if (!stars.length) {
        return;
    }


    stars.forEach(
        star => {

            star.addEventListener(
                "click",
                () => {

                    const rating =
                        Number(
                            star.dataset.rating
                        );


                    if (
                        reviewRatingInput
                    ) {

                        reviewRatingInput.value =
                            rating;

                    }


                    stars.forEach(
                        item => {

                            const itemRating =
                                Number(
                                    item.dataset.rating
                                );


                            item.classList.toggle(
                                "active",
                                itemRating <=
                                rating
                            );

                        }
                    );

                }
            );

        }
    );

}


/* =========================================================
   REVIEW — AUTO FILL NAME
========================================================= */

function setReviewUserName() {

    if (!reviewNameInput) {
        return;
    }


    const user =
        getLoggedInUser();


    if (
        user &&
        (
            user.name ||
            user.fullName
        )
    ) {

        reviewNameInput.value =
            user.name ||
            user.fullName;


        reviewNameInput.readOnly =
            true;


        reviewNameInput.classList.add(
            "auto-filled"
        );

    }

}


/* =========================================================
   REVIEW — WRITE FORM
========================================================= */

function setupReviewFormUI() {

    const writeButton =
        document.getElementById(
            "writeReviewBtn"
        );


    const firstReviewButton =
        document.getElementById(
            "writeFirstReviewBtn"
        );


    const closeButton =
        document.getElementById(
            "closeReviewForm"
        );


    const openForm = () => {

        const token =
            localStorage.getItem(
                "token"
            );


        if (!token) {

            showAlert(
                "info",
                "Login Required",
                "Please login to write a review."
            );


            setTimeout(
                () => {

                    window.location.href =
                        "login.html";

                },
                900
            );


            return;

        }


        if (reviewFormWrapper) {

            reviewFormWrapper.hidden =
                false;


            reviewFormWrapper.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "center"
            });

        }

    };


    const closeForm = () => {

        if (reviewFormWrapper) {

            reviewFormWrapper.hidden =
                true;

        }

    };


    writeButton?.addEventListener(
        "click",
        openForm
    );


    firstReviewButton?.addEventListener(
        "click",
        openForm
    );


    closeButton?.addEventListener(
        "click",
        closeForm
    );

}


/* =========================================================
   REVIEW — CHARACTER COUNT
========================================================= */

function setupReviewCharacterCount() {

    if (
        !reviewCommentInput ||
        !reviewCharCount
    ) {
        return;
    }


    const update =
        () => {

            reviewCharCount.textContent =
                reviewCommentInput.value.length;

        };


    reviewCommentInput.addEventListener(
        "input",
        update
    );


    update();

}


/* =========================================================
   REVIEW — IMAGE LIMIT
========================================================= */

function setupReviewImagePreview() {

    if (!reviewImagesInput) {
        return;
    }


    reviewImagesInput.addEventListener(
        "change",
        () => {

            const files =
                Array.from(
                    reviewImagesInput.files ||
                    []
                );


            if (
                files.length <= 5
            ) {
                return;
            }


            showAlert(
                "warning",
                "Maximum 5 Images",
                "You can upload up to 5 review images."
            );


            const dataTransfer =
                new DataTransfer();


            files
                .slice(0, 5)
                .forEach(
                    file =>
                        dataTransfer.items.add(
                            file
                        )
                );


            reviewImagesInput.files =
                dataTransfer.files;

        }
    );

}


/* =========================================================
   REVIEW — SUBMIT
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

                showAlert(
                    "info",
                    "Login Required",
                    "Please login to write a review."
                );

                return;

            }


            if (!productId) {

                showAlert(
                    "error",
                    "Product Not Found",
                    "Unable to identify this product."
                );

                return;

            }


            const rating =
                Number(
                    reviewRatingInput?.value ||
                    0
                );


            const comment =
                String(
                    reviewCommentInput?.value ||
                    ""
                ).trim();


            if (
                rating < 1 ||
                rating > 5
            ) {

                showAlert(
                    "warning",
                    "Select Rating",
                    "Please select a star rating."
                );

                return;

            }


            if (
                comment.length < 3
            ) {

                showAlert(
                    "warning",
                    "Write A Review",
                    "Please write at least a few words."
                );

                return;

            }


            const formData =
                new FormData();


            formData.append(
                "product",
                productId
            );


            formData.append(
                "rating",
                rating
            );


            formData.append(
                "comment",
                comment
            );


            if (
                reviewNameInput &&
                reviewNameInput.value.trim()
            ) {

                formData.append(
                    "name",
                    reviewNameInput.value.trim()
                );

            }


            if (
                reviewImagesInput &&
                reviewImagesInput.files
            ) {

                Array
                    .from(
                        reviewImagesInput.files
                    )
                    .slice(0, 5)
                    .forEach(
                        file => {

                            formData.append(
                                "images",
                                file
                            );

                        }
                    );

            }


            const submitButton =
                document.getElementById(
                    "submitReviewBtn"
                ) ||
                reviewForm.querySelector(
                    '[type="submit"]'
                );


            const originalHTML =
                submitButton
                    ? submitButton.innerHTML
                    : "";


            if (submitButton) {

                submitButton.disabled =
                    true;


                submitButton.innerHTML = `

                    <i class="ri-loader-4-line ri-spin"></i>

                    Submitting...

                `;

            }


            try {

                const response =
                    await fetch(
                        REVIEW_API,
                        {

                            method:
                                "POST",

                            headers: {

                                Authorization:
                                    `Bearer ${token}`

                            },

                            body:
                                formData

                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to submit review."
                    );

                }


                showAlert(
                    "success",
                    "Review Submitted",
                    "Thank you for your review!",
                    1800
                );


                reviewForm.reset();


                if (reviewRatingInput) {

                    reviewRatingInput.value =
                        "";

                }


                document
                    .querySelectorAll(
                        ".review-star"
                    )
                    .forEach(
                        star =>
                            star.classList.remove(
                                "active"
                            )
                    );


                setReviewUserName();


                /*
                   After submission:
                   show only newest review.
                */

                showAllReviews =
                    false;


                await loadProductReviews();

            }
            catch (error) {

                console.error(
                    "SUBMIT REVIEW ERROR:",
                    error
                );


                const message =
                    String(
                        error.message ||
                        ""
                    );


                if (
                    message
                        .toLowerCase()
                        .includes(
                            "duplicate"
                        ) ||
                    message.includes(
                        "E11000"
                    )
                ) {

                    showAlert(
                        "warning",
                        "Review Already Exists",
                        "You have already reviewed this product."
                    );

                }
                else {

                    showAlert(
                        "error",
                        "Review Failed",
                        message ||
                        "Unable to submit review."
                    );

                }

            }
            finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;


                    submitButton.innerHTML =
                        originalHTML;

                }

            }

        }
    );

}


/* =========================================================
   REVIEW — DELETE
========================================================= */

function setupReviewDeleteButtons() {

    document
        .querySelectorAll(
            ".delete-review-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const reviewId =
                            button.dataset.reviewId;


                        if (!reviewId) {
                            return;
                        }


                        const token =
                            localStorage.getItem(
                                "token"
                            );


                        if (!token) {

                            window.location.href =
                                "login.html";

                            return;

                        }


                        let confirmed =
                            true;


                        if (
                            typeof window.Swal !==
                            "undefined"
                        ) {

                            const result =
                                await Swal.fire({

                                    icon:
                                        "warning",

                                    title:
                                        "Delete Review?",

                                    text:
                                        "This review will be permanently deleted.",

                                    showCancelButton:
                                        true,

                                    confirmButtonText:
                                        "Delete",

                                    cancelButtonText:
                                        "Cancel",

                                    confirmButtonColor:
                                        "#111111"

                                });


                            confirmed =
                                result.isConfirmed;

                        }
                        else {

                            confirmed =
                                window.confirm(
                                    "Delete this review?"
                                );

                        }


                        if (!confirmed) {
                            return;
                        }


                        try {

                            const response =
                                await fetch(
                                    `${REVIEW_API}/${encodeURIComponent(reviewId)}`,
                                    {

                                        method:
                                            "DELETE",

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
                                !data.success
                            ) {

                                throw new Error(
                                    data.message ||
                                    "Unable to delete review."
                                );

                            }


                            showAlert(
                                "success",
                                "Review Deleted",
                                "",
                                1200
                            );


                            showAllReviews =
                                false;


                            await loadProductReviews();

                        }
                        catch (error) {

                            console.error(
                                "DELETE REVIEW ERROR:",
                                error
                            );


                            showAlert(
                                "error",
                                "Delete Failed",
                                error.message ||
                                "Unable to delete review."
                            );

                        }

                    }
                );

            }
        );

}


/* =========================================================
   REVIEW SORT
========================================================= */

function setupReviewSort() {

    if (!reviewSort) {
        return;
    }


    reviewSort.addEventListener(
        "change",
        () => {

            reviewSortMode =
                reviewSort.value ||
                "newest";


            /*
               Sorting should preserve
               the premium one-review state.
            */

            renderReviews();

        }
    );

}


/* =========================================================
   GLOBAL REVIEW FUNCTION
========================================================= */

window.loadProductReviews =
    loadProductReviews;


/* =========================================================
   GLOBAL IMAGE ERROR
========================================================= */

document.addEventListener(
    "error",
    event => {

        const target =
            event.target;


        if (
            target &&
            target.tagName ===
            "IMG"
        ) {

            handleImageError(
                target
            );

        }

    },
    true
);


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
           Product
        */

        if (qtyInput) {

            qtyInput.value =
                "1";

        }


        setupProductTabs();


        /*
           Reviews
        */

        setupReviewRating();

        setupReviewFormUI();

        setupReviewCharacterCount();

        setupReviewImagePreview();

        setupReviewSort();

        setReviewUserName();


        /*
           Product
        */

        loadProduct();


        /*
           Existing global cart
        */

        if (
            typeof window.updateCartCount ===
            "function"
        ) {

            window.updateCartCount();

        }


        /*
           Existing global wishlist
        */

        if (
            typeof window.loadWishlistCount ===
            "function"
        ) {

            window.loadWishlistCount();

        }

    }
);


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "ZM LABEL Premium Product.js Loaded"
);

console.log(
    "Product API:",
    PRODUCT_API
);

console.log(
    "Review API:",
    REVIEW_API
);

console.log(
    "Uploads:",
    ZM_UPLOADS_ROOT
);