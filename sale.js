/* =========================================================
   ZM LABEL — SALE PAGE
   PREMIUM SALE PAGE JS
   MATCHES CURRENT SALE HTML
========================================================= */

"use strict";


/* =========================================================
   API CONFIG
========================================================= */
const API_URL = "https://zmlabel-production.up.railway.app";

const PRODUCTS_API =
    `${API_ROOT}/products`;

const WISHLIST_API =
    `${API_ROOT}/wishlist`;


/* =========================================================
   GLOBAL STATE
========================================================= */

let allProducts = [];

let saleProducts = [];

let filteredProducts = [];

let currentSort = "default";

let selectedCategory = "";

let selectedDiscount = 0;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupFilter();

        setupSorting();

        setupMobileMenu();

        setupRetry();

        loadSaleProducts();

        loadWishlistCount();

    }
);


/* =========================================================
   API HELPER
========================================================= */

async function apiRequest(
    url,
    options = {}
) {

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


    const response =
        await fetch(
            url,
            {
                ...options,
                headers
            }
        );


    if (!response.ok) {

        throw new Error(
            `API Error: ${response.status}`
        );

    }


    return response.json();

}


/* =========================================================
   NORMALIZE VALUE
========================================================= */

function normalizeValue(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /&/g,
            " and "
        )
        .replace(
            /[-_]+/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/* =========================================================
   SERVER ROOT
========================================================= */

function getServerRoot() {

    const apiBase =
        String(
            window.ZM_API_BASE ||
            "http://localhost:5000/api"
        )
        .replace(
            /\/+$/,
            ""
        );


    if (
        apiBase.endsWith("/api")
    ) {

        return apiBase.slice(
            0,
            -4
        );

    }


    return apiBase;

}


/* =========================================================
   IMAGE URL
========================================================= */

function getImageUrl(
    image
) {

    const fallback =
        "images/placeholder.jpg";


    if (!image) {

        return fallback;

    }


    const value =
        String(
            image
        )
        .trim();


    if (
        value.startsWith("http://") ||
        value.startsWith("https://") ||
        value.startsWith("data:")
    ) {

        return value;

    }


    const serverRoot =
        getServerRoot();


    if (
        value.startsWith("/uploads/")
    ) {

        return (
            serverRoot +
            value
        );

    }


    if (
        value.startsWith("uploads/")
    ) {

        return (
            serverRoot +
            "/" +
            value
        );

    }


    if (
        value.startsWith("/")
    ) {

        return (
            serverRoot +
            value
        );

    }


    return (
        serverRoot +
        "/uploads/" +
        value
    );

}


/* =========================================================
   PRODUCT IMAGE
========================================================= */

function getProductImage(
    product
) {

    if (
        product &&
        product.image
    ) {

        return getImageUrl(
            product.image
        );

    }


    if (
        product &&
        Array.isArray(
            product.images
        ) &&
        product.images.length
    ) {

        return getImageUrl(
            product.images[0]
        );

    }


    if (
        product &&
        Array.isArray(
            product.imageUrls
        ) &&
        product.imageUrls.length
    ) {

        return getImageUrl(
            product.imageUrls[0]
        );

    }


    return "images/placeholder.jpg";

}


/* =========================================================
   LOAD SALE PRODUCTS
========================================================= */

async function loadSaleProducts() {

    showLoading();

    hideError();


    try {

        const data =
            await apiRequest(
                PRODUCTS_API
            );


        allProducts =
            Array.isArray(data)
                ? data
                : Array.isArray(
                    data?.products
                )
                    ? data.products
                    : [];


        /*
         * SALE PRODUCTS
         *
         * Primary:
         * category = SALE
         *
         * Also supports:
         * storePage = sale
         * page = sale
         * sale = true
         *
         * Fallback:
         * discount > 0
         */

        const directlyAssigned =
            allProducts.filter(
                product => {

                    const category =
                        normalizeValue(
                            product?.category
                        );


                    const storePage =
                        normalizeValue(
                            product?.storePage
                        );


                    const page =
                        normalizeValue(
                            product?.page
                        );


                    const saleFlag =
                        product?.sale === true ||
                        product?.sale === "true";


                    return (
                        category === "sale" ||
                        storePage === "sale" ||
                        page === "sale" ||
                        saleFlag
                    );

                }
            );


        if (
            directlyAssigned.length
        ) {

            saleProducts =
                directlyAssigned;

        }
        else {

            /*
             * BACKUP
             *
             * If no product has explicit
             * Sale assignment, show
             * discounted products.
             */

            saleProducts =
                allProducts.filter(
                    product =>
                        Number(
                            product?.discount ||
                            0
                        ) > 0
                );

        }


        /*
         * Remove duplicate products.
         */

        const uniqueProducts =
            new Map();


        saleProducts.forEach(
            product => {

                const id =
                    String(
                        product?._id ||
                        product?.id ||
                        ""
                    );


                if (
                    id
                ) {

                    uniqueProducts.set(
                        id,
                        product
                    );

                }

            }
        );


        saleProducts =
            Array.from(
                uniqueProducts.values()
            );


        /*
         * Initial state.
         */

        filteredProducts =
            [
                ...saleProducts
            ];


        hideLoading();

        updateProductCount();

        updateEmptyState();

        renderProducts();


    }
    catch (error) {

        console.error(
            "ZM LABEL Sale Products Error:",
            error
        );


        hideLoading();

        showError(
            "Unable to load sale products. Please try again."
        );

    }

}


/* =========================================================
   SALE PRICE
========================================================= */

function getSalePrice(
    product
) {

    const price =
        Number(
            product?.price ||
            0
        );


    const discount =
        Number(
            product?.discount ||
            0
        );


    if (
        discount <= 0
    ) {

        return Math.round(
            price
        );

    }


    return Math.round(
        price -
        (
            price *
            discount /
            100
        )
    );

}


/* =========================================================
   PRODUCT COUNT
========================================================= */

function updateProductCount() {

    const element =
        document.getElementById(
            "saleProductCount"
        );


    if (!element) {

        return;

    }


    const count =
        filteredProducts.length;


    element.textContent =
        `${count} ${
            count === 1
                ? "Product"
                : "Products"
        }`;

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    const loading =
        document.getElementById(
            "saleLoading"
        );


    const grid =
        document.getElementById(
            "saleProductsGrid"
        );


    if (loading) {

        loading.hidden =
            false;

    }


    if (grid) {

        grid.innerHTML =
            "";

    }

}


/* =========================================================
   HIDE LOADING
========================================================= */

function hideLoading() {

    const loading =
        document.getElementById(
            "saleLoading"
        );


    if (loading) {

        loading.hidden =
            true;

    }

}


/* =========================================================
   ERROR
========================================================= */

function showError(
    message
) {

    const box =
        document.getElementById(
            "saleError"
        );


    const messageBox =
        document.getElementById(
            "saleErrorMessage"
        );


    if (messageBox) {

        messageBox.textContent =
            message;

    }


    if (box) {

        box.hidden =
            false;

    }

}


/* =========================================================
   HIDE ERROR
========================================================= */

function hideError() {

    const box =
        document.getElementById(
            "saleError"
        );


    if (box) {

        box.hidden =
            true;

    }

}


/* =========================================================
   EMPTY STATE
========================================================= */

function updateEmptyState() {

    const empty =
        document.getElementById(
            "saleEmpty"
        );


    if (!empty) {

        return;

    }


    empty.hidden =
        filteredProducts.length !== 0;

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    const grid =
        document.getElementById(
            "saleProductsGrid"
        );


    if (!grid) {

        return;

    }


    grid.innerHTML =
        "";


    if (
        !filteredProducts.length
    ) {

        updateEmptyState();

        return;

    }


    const fragment =
        document.createDocumentFragment();


    filteredProducts.forEach(
        product => {

            fragment.appendChild(
                createProductCard(
                    product
                )
            );

        }
    );


    grid.appendChild(
        fragment
    );


    syncWishlistStates();

}


/* =========================================================
   CREATE PRODUCT CARD
========================================================= */

function createProductCard(
    product
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "sale-product-card";


    const id =
        String(
            product?._id ||
            product?.id ||
            ""
        );


    const name =
        product?.name ||
        "Sale Product";


    const brand =
        product?.brand ||
        "ZM LABEL";


    const oldPrice =
        Number(
            product?.price ||
            0
        );


    const discount =
        Number(
            product?.discount ||
            0
        );


    const salePrice =
        getSalePrice(
            product
        );


    const image =
        getProductImage(
            product
        );


    const badge =
        String(
            product?.badge ||
            "SALE"
        );


    const saveAmount =
        Math.max(
            0,
            oldPrice -
            salePrice
        );


    card.dataset.productId =
        id;


    card.innerHTML = `

        <div class="sale-product-image">

            <div class="sale-card-badges">

                <span class="sale-card-badge">
                    ${escapeHTML(
                        badge
                    )}
                </span>


                ${
                    discount > 0
                        ? `
                            <span class="sale-card-discount">
                                -${discount}%
                            </span>
                        `
                        : ""
                }

            </div>


            <button
                type="button"
                class="sale-wishlist-btn"
                data-wishlist-id="${escapeHTML(id)}"
                aria-label="Add ${escapeHTML(name)} to wishlist"
            >

                <i class="ri-heart-line"></i>

            </button>


            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(name)}"
                loading="lazy"
                draggable="false"
            >


            <button
                type="button"
                class="sale-view-product"
                data-product-id="${escapeHTML(id)}"
            >

                View Product

                <i class="ri-arrow-right-line"></i>

            </button>

        </div>


        <div class="sale-product-info">

            <div class="sale-product-brand">
                ${escapeHTML(
                    brand
                )}
            </div>


            <h3 class="sale-product-name">
                ${escapeHTML(
                    name
                )}
            </h3>


            <div class="sale-product-pricing">

                <span class="sale-current-price">
                    Rs. ${salePrice.toLocaleString()}
                </span>


                ${
                    discount > 0
                        ? `
                            <span class="sale-original-price">
                                Rs. ${oldPrice.toLocaleString()}
                            </span>
                        `
                        : ""
                }

            </div>


            ${
                discount > 0
                    ? `
                        <div class="sale-save">
                            You save Rs.
                            ${saveAmount.toLocaleString()}
                        </div>
                    `
                    : ""
            }

        </div>

    `;


    const imageElement =
        card.querySelector(
            "img"
        );


    if (imageElement) {

        imageElement.addEventListener(
            "error",
            () => {

                imageElement.onerror =
                    null;

                imageElement.src =
                    "images/placeholder.jpg";

            }
        );

    }


    return card;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /[&<>"']/g,
        character => {

            const map = {

                "&":
                    "&amp;",

                "<":
                    "&lt;",

                ">":
                    "&gt;",

                '"':
                    "&quot;",

                "'":
                    "&#039;"

            };


            return map[
                character
            ];

        }
    );

}


/* =========================================================
   PRODUCT ACTIONS
========================================================= */

document.addEventListener(
    "click",
    event => {

        const wishlistButton =
            event.target.closest(
                ".sale-wishlist-btn"
            );


        if (wishlistButton) {

            event.preventDefault();

            event.stopPropagation();


            const id =
                wishlistButton.dataset
                    .wishlistId;


            toggleWishlist(
                id
            );


            return;

        }


        const productButton =
            event.target.closest(
                ".sale-view-product"
            );


        if (productButton) {

            event.preventDefault();

            event.stopPropagation();


            const id =
                productButton.dataset
                    .productId;


            openProduct(
                id
            );

        }

    }
);


/* =========================================================
   OPEN PRODUCT
========================================================= */

function openProduct(
    id
) {

    if (!id) {

        return;

    }


    window.location.href =
        `product.html?id=${encodeURIComponent(
            id
        )}`;

}


/* =========================================================
   SORTING
========================================================= */

function setupSorting() {

    const sort =
        document.getElementById(
            "saleSort"
        );


    if (!sort) {

        return;

    }


    sort.addEventListener(
        "change",
        () => {

            currentSort =
                sort.value ||
                "default";


            applyFiltersAndSort();

        }
    );

}


/* =========================================================
   FILTER SETUP
   ONE CATEGORY
   ONE DISCOUNT
========================================================= */

function setupFilter() {

    const filterButton =
        document.getElementById(
            "saleFilterBtn"
        );


    const panel =
        document.getElementById(
            "saleFilterPanel"
        );


    const closeButton =
        document.getElementById(
            "closeSaleFilter"
        );


    const applyButton =
        document.getElementById(
            "applySaleFilters"
        );


    const clearButton =
        document.getElementById(
            "clearSaleFilters"
        );


    /*
     * OPEN FILTER
     */

    if (
        filterButton &&
        panel
    ) {

        filterButton.addEventListener(
            "click",
            () => {

                panel.hidden =
                    false;

                document.body.classList.add(
                    "sale-filter-open"
                );

            }
        );

    }


    /*
     * CLOSE FILTER
     */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeFilterPanel
        );

    }


    /*
     * APPLY FILTER
     */

    if (applyButton) {

        applyButton.addEventListener(
            "click",
            applySelectedFilters
        );

    }


    /*
     * CLEAR FILTER
     */

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearFilters
        );

    }


    /*
     * CATEGORY CHECKBOXES
     * ONLY ONE
     */

    const categoryInputs =
        document.querySelectorAll(
            'input[name="saleCategory"]'
        );


    categoryInputs.forEach(
        input => {

            input.addEventListener(
                "change",
                () => {

                    if (
                        !input.checked
                    ) {

                        return;

                    }


                    categoryInputs.forEach(
                        other => {

                            if (
                                other !==
                                input
                            ) {

                                other.checked =
                                    false;

                            }

                        }
                    );

                }
            );

        }
    );


    /*
     * DISCOUNT CHECKBOXES
     * ONLY ONE
     */

    const discountInputs =
        document.querySelectorAll(
            'input[name="saleDiscount"]'
        );


    discountInputs.forEach(
        input => {

            input.addEventListener(
                "change",
                () => {

                    if (
                        !input.checked
                    ) {

                        return;

                    }


                    discountInputs.forEach(
                        other => {

                            if (
                                other !==
                                input
                            ) {

                                other.checked =
                                    false;

                            }

                        }
                    );

                }
            );

        }
    );


    /*
     * Make sure All is selected
     * initially if nothing selected.
     */

    const all =
        document.querySelector(
            'input[name="saleCategory"][value="all"]'
        );


    const selected =
        document.querySelector(
            'input[name="saleCategory"]:checked'
        );


    if (
        all &&
        !selected
    ) {

        all.checked =
            true;

    }

}


/* =========================================================
   APPLY SELECTED FILTERS
========================================================= */

function applySelectedFilters() {

    /*
     * CATEGORY
     */

    const categoryInput =
        document.querySelector(
            'input[name="saleCategory"]:checked'
        );


    if (
        categoryInput &&
        normalizeValue(
            categoryInput.value
        ) !== "all"
    ) {

        selectedCategory =
            normalizeCategory(
                categoryInput.value
            );

    }
    else {

        selectedCategory =
            "";

    }


    /*
     * DISCOUNT
     */

    const discountInput =
        document.querySelector(
            'input[name="saleDiscount"]:checked'
        );


    selectedDiscount =
        discountInput
            ? Number(
                discountInput.value
            )
            : 0;


    applyFiltersAndSort();

    closeFilterPanel();

}


/* =========================================================
   APPLY FILTERS + SORT
========================================================= */

function applyFiltersAndSort() {

    let results =
        [
            ...saleProducts
        ];


    /*
     * CATEGORY
     */

    if (
        selectedCategory
    ) {

        results =
            results.filter(
                product => {

                    const category =
                        normalizeCategory(
                            product?.category
                        );


                    const subCategory =
                        normalizeCategory(
                            product?.subCategory
                        );


                    const storePage =
                        normalizeCategory(
                            product?.storePage
                        );


                    const page =
                        normalizeCategory(
                            product?.page
                        );


                    return (

                        categoryMatches(
                            category,
                            selectedCategory
                        )

                        ||

                        categoryMatches(
                            subCategory,
                            selectedCategory
                        )

                        ||

                        categoryMatches(
                            storePage,
                            selectedCategory
                        )

                        ||

                        categoryMatches(
                            page,
                            selectedCategory
                        )

                    );

                }
            );

    }


    /*
     * DISCOUNT
     */

    if (
        selectedDiscount > 0
    ) {

        results =
            results.filter(
                product =>
                    Number(
                        product?.discount ||
                        0
                    ) >=
                    selectedDiscount
            );

    }


    /*
     * SORT
     */

    switch (
        currentSort
    ) {

        case "price-low":

            results.sort(
                (a, b) =>
                    getSalePrice(a) -
                    getSalePrice(b)
            );

            break;


        case "price-high":

            results.sort(
                (a, b) =>
                    getSalePrice(b) -
                    getSalePrice(a)
            );

            break;


        case "discount-high":

            results.sort(
                (a, b) =>
                    Number(
                        b?.discount ||
                        0
                    ) -
                    Number(
                        a?.discount ||
                        0
                    )
            );

            break;


        case "name":

            results.sort(
                (a, b) =>
                    String(
                        a?.name ||
                        ""
                    )
                    .localeCompare(
                        String(
                            b?.name ||
                            ""
                        )
                    )
            );

            break;


        case "newest":

            results.sort(
                (a, b) => {

                    const dateA =
                        new Date(
                            a?.createdAt ||
                            0
                        )
                        .getTime();


                    const dateB =
                        new Date(
                            b?.createdAt ||
                            0
                        )
                        .getTime();


                    return (
                        dateB -
                        dateA
                    );

                }
            );

            break;


        case "default":

        default:

            break;

    }


    filteredProducts =
        results;


    updateProductCount();

    updateEmptyState();

    renderProducts();

}


/* =========================================================
   NORMALIZE CATEGORY
========================================================= */

function normalizeCategory(
    value
) {

    return String(
        value || ""
    )
    .toLowerCase()
    .trim()
    .replace(
        /&/g,
        " and "
    )
    .replace(
        /[-_]+/g,
        " "
    )
    .replace(
        /\s+/g,
        " "
    )
    .trim();

}


/* =========================================================
   CATEGORY MATCHING
========================================================= */

function categoryMatches(
    actual,
    selected
) {

    if (
        !actual ||
        !selected
    ) {

        return false;

    }


    /*
     * HOODIES & SHIRTS
     */

    if (
        selected ===
        "hoodies and shirts"
    ) {

        return (

            actual ===
                "hoodies and shirts"

            ||

            actual.includes(
                "hoodie"
            )

            ||

            actual.includes(
                "shirt"
            )

        );

    }


    /*
     * OVERSIZED TEES
     */

    if (
        selected ===
        "oversized tees"
    ) {

        return (

            actual ===
                "oversized tees"

            ||

            actual ===
                "oversized tee"

            ||

            actual.includes(
                "oversized"
            )

        );

    }


    /*
     * BOTTOM
     */

    if (
        selected ===
        "bottom"
    ) {

        return (

            actual ===
                "bottom"

            ||

            actual.includes(
                "bottom"
            )

            ||

            actual.includes(
                "trouser"
            )

            ||

            actual.includes(
                "cargo"
            )

            ||

            actual.includes(
                "jean"
            )

            ||

            actual.includes(
                "track pant"
            )

        );

    }


    /*
     * FOOTWEAR
     */

    if (
        selected ===
        "footwear"
    ) {

        return (

            actual ===
                "footwear"

            ||

            actual.includes(
                "footwear"
            )

            ||

            actual.includes(
                "shoe"
            )

            ||

            actual.includes(
                "sneaker"
            )

            ||

            actual.includes(
                "slide"
            )

        );

    }


    /*
     * GENERAL
     */

    return (

        actual ===
            selected

        ||

        actual.includes(
            selected
        )

        ||

        selected.includes(
            actual
        )

    );

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearFilters() {

    /*
     * Uncheck category.
     */

    document
        .querySelectorAll(
            'input[name="saleCategory"]'
        )
        .forEach(
            input => {

                input.checked =
                    false;

            }
        );


    /*
     * Select All.
     */

    const all =
        document.querySelector(
            'input[name="saleCategory"][value="all"]'
        );


    if (all) {

        all.checked =
            true;

    }


    /*
     * Clear discounts.
     */

    document
        .querySelectorAll(
            'input[name="saleDiscount"]'
        )
        .forEach(
            input => {

                input.checked =
                    false;

            }
        );


    /*
     * Reset state.
     */

    selectedCategory =
        "";

    selectedDiscount =
        0;


    /*
     * Reset sorting.
     */

    currentSort =
        "default";


    const sort =
        document.getElementById(
            "saleSort"
        );


    if (sort) {

        sort.value =
            "default";

    }


    filteredProducts =
        [
            ...saleProducts
        ];


    updateProductCount();

    updateEmptyState();

    renderProducts();

    closeFilterPanel();

}


/* =========================================================
   CLOSE FILTER
========================================================= */

function closeFilterPanel() {

    const panel =
        document.getElementById(
            "saleFilterPanel"
        );


    if (panel) {

        panel.hidden =
            true;

    }


    document.body.classList.remove(
        "sale-filter-open"
    );

}


/* =========================================================
   RETRY
========================================================= */

function setupRetry() {

    const retry =
        document.getElementById(
            "retrySaleProducts"
        );


    if (!retry) {

        return;

    }


    retry.addEventListener(
        "click",
        () => {

            loadSaleProducts();

        }
    );

}


/* =========================================================
   MOBILE MENU
   MATCHES CURRENT HTML
========================================================= */

function setupMobileMenu() {

    const menuButton =
        document.getElementById(
            "menuBtn"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const overlay =
        document.getElementById(
            "overlay"
        );


    const closeButton =
        document.getElementById(
            "closeMenu"
        );


    if (
        !menuButton ||
        !sidebar
    ) {

        return;

    }


    function openMenu() {

        sidebar.classList.add(
            "active"
        );


        if (overlay) {

            overlay.classList.add(
                "active"
            );

        }


        document.body.classList.add(
            "menu-open"
        );

    }


    function closeMenu() {

        sidebar.classList.remove(
            "active"
        );


        if (overlay) {

            overlay.classList.remove(
                "active"
            );

        }


        document.body.classList.remove(
            "menu-open"
        );

    }


    menuButton.addEventListener(
        "click",
        openMenu
    );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeMenu
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeMenu
        );

    }


    sidebar
        .querySelectorAll(
            "a"
        )
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    closeMenu
                );

            }
        );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeMenu();

            }

        }
    );

}


/* =========================================================
   WISHLIST TOGGLE
========================================================= */

async function toggleWishlist(
    productId
) {

    if (!productId) {

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


    try {

        const data =
            await apiRequest(
                WISHLIST_API,
                {

                    method:
                        "POST",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({
                            productId:
                                String(
                                    productId
                                )
                        })

                }
            );


        const buttons =
            document.querySelectorAll(
                ".sale-wishlist-btn"
            );


        buttons.forEach(
            button => {

                if (
                    String(
                        button.dataset
                            .wishlistId
                    ) !==
                    String(
                        productId
                    )
                ) {

                    return;

                }


                const icon =
                    button.querySelector(
                        "i"
                    );


                if (
                    data?.action ===
                    "added"
                ) {

                    button.classList.add(
                        "active"
                    );


                    if (icon) {

                        icon.className =
                            "ri-heart-fill";

                    }


                    button.setAttribute(
                        "aria-label",
                        "Remove from wishlist"
                    );

                }


                else if (
                    data?.action ===
                    "removed"
                ) {

                    button.classList.remove(
                        "active"
                    );


                    if (icon) {

                        icon.className =
                            "ri-heart-line";

                    }


                    button.setAttribute(
                        "aria-label",
                        "Add to wishlist"
                    );

                }

            }
        );


        if (
            data?.action ===
            "added"
        ) {

            showToast(
                "Product added to Wishlist"
            );

        }


        if (
            data?.action ===
            "removed"
        ) {

            showToast(
                "Product removed from Wishlist"
            );

        }


        await loadWishlistCount();

    }
    catch (error) {

        console.error(
            "Wishlist Error:",
            error
        );


        showToast(
            "Unable to update wishlist"
        );

    }

}


/* =========================================================
   SYNC WISHLIST STATES
========================================================= */

async function syncWishlistStates() {

    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        return;

    }


    try {

        const data =
            await apiRequest(
                WISHLIST_API,
                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        if (
            !Array.isArray(
                data?.products
            )
        ) {

            return;

        }


        const ids =
            new Set();


        data.products.forEach(
            item => {

                const product =
                    item?.product ||
                    item;


                const id =
                    product?._id ||
                    product?.id ||
                    item?.productId ||
                    item?._id;


                if (id) {

                    ids.add(
                        String(id)
                    );

                }

            }
        );


        document
            .querySelectorAll(
                ".sale-wishlist-btn"
            )
            .forEach(
                button => {

                    const id =
                        String(
                            button.dataset
                                .wishlistId ||
                            ""
                        );


                    const icon =
                        button.querySelector(
                            "i"
                        );


                    if (
                        ids.has(id)
                    ) {

                        button.classList.add(
                            "active"
                        );


                        if (icon) {

                            icon.className =
                                "ri-heart-fill";

                        }


                        button.setAttribute(
                            "aria-label",
                            "Remove from wishlist"
                        );

                    }
                    else {

                        button.classList.remove(
                            "active"
                        );


                        if (icon) {

                            icon.className =
                                "ri-heart-line";

                        }


                        button.setAttribute(
                            "aria-label",
                            "Add to wishlist"
                        );

                    }

                }
            );

    }
    catch (error) {

        console.warn(
            "Wishlist sync failed:",
            error
        );

    }

}


/* =========================================================
   WISHLIST COUNT
========================================================= */

async function loadWishlistCount() {

    const badge =
        document.getElementById(
            "wishlistCount"
        );


    if (!badge) {

        return;

    }


    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        badge.textContent =
            "0";

        return;

    }


    try {

        const data =
            await apiRequest(
                WISHLIST_API,
                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        badge.textContent =
            Array.isArray(
                data?.products
            )
                ? data.products.length
                : "0";

    }
    catch (error) {

        console.warn(
            "Wishlist count failed:",
            error
        );


        badge.textContent =
            "0";

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message
) {

    let toast =
        document.getElementById(
            "zmSaleToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "zmSaleToast";


        toast.className =
            "zm-sale-toast";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.zmSaleToastTimer
    );


    window.zmSaleToastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* =========================================================
   PUBLIC API
========================================================= */

window.ZMSale = {

    reload:
        loadSaleProducts,

    resetFilters:
        clearFilters,

    getProducts:
        () => [
            ...filteredProducts
        ],

    getSalePrice:
        getSalePrice

};


/* =========================================================
   GLOBAL FALLBACKS
========================================================= */

window.loadSaleProducts =
    loadSaleProducts;

window.toggleWishlist =
    toggleWishlist;

window.openProduct =
    openProduct;

window.resetFilters =
    clearFilters;


/* =========================================================
   READY
========================================================= */

console.log(
    "✅ ZM LABEL — Premium Sale JS Loaded"
);