/* =========================================================
   ZM LABEL
   SEARCH.JS
   PREMIUM SEARCH EXPERIENCE
   BACKEND IMAGE PATH FIXED
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIG
    ===================================================== */

    const API_BASE =
        window.API_BASE ||
        window.API ||
        "http://localhost:5000/api";

    const PRODUCTS_API =
        `${API_BASE}/products`;


    /*
       Backend root automatically calculate karega.

       Example:

       API_BASE
       http://localhost:5000/api

       BACKEND_ROOT
       http://localhost:5000
    */

    const BACKEND_ROOT =
        API_BASE.replace(/\/api\/?$/, "");


    /* =====================================================
       DOM
    ===================================================== */

    const searchInput =
        document.getElementById("searchInput");

    const clearSearch =
        document.getElementById("clearSearch");

    const suggestions =
        document.getElementById("suggestions");

    const historyList =
        document.getElementById("history-list");

    const clearHistory =
        document.getElementById("clear-history");

    const searchProducts =
        document.getElementById("searchProducts");

    const searchCount =
        document.getElementById("searchCount");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const sortFilter =
        document.getElementById("sortFilter");

    const noResult =
        document.getElementById("noResult");

    const trendTags =
        document.querySelectorAll(".trend-tag");


    /* =====================================================
       STATE
    ===================================================== */

    let allProducts = [];

    let currentSearch = "";

    let searchHistory = [];

    try {

        searchHistory =
            JSON.parse(
                localStorage.getItem(
                    "zmSearchHistory"
                ) || "[]"
            );

        if (!Array.isArray(searchHistory)) {
            searchHistory = [];
        }

    }
    catch {

        searchHistory = [];

    }


    /* =====================================================
       HTML ESCAPE
    ===================================================== */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       NORMALIZE
    ===================================================== */

    function normalize(value) {

        return String(value || "")
            .toLowerCase()
            .trim();

    }


    /* =====================================================
       PRODUCT NAME
    ===================================================== */

    function getProductName(product) {

        return (
            product?.name ||
            product?.productName ||
            product?.title ||
            "Product"
        );

    }


    /* =====================================================
       PRODUCT CATEGORY
    ===================================================== */

    function getProductCategory(product) {

        return normalize(

            product?.category ||
            product?.categoryName ||
            product?.storePage ||
            ""

        );

    }


    /* =====================================================
       PRODUCT PRICE
    ===================================================== */

    function getProductPrice(product) {

        const price =
            Number(
                product?.price ??
                product?.salePrice ??
                0
            );

        return Number.isFinite(price)
            ? price
            : 0;

    }


    /* =====================================================
       PRODUCT ID
    ===================================================== */

    function getProductId(product) {

        return (
            product?._id ||
            product?.id ||
            product?.productId ||
            ""
        );

    }


    /* =====================================================
       PRODUCT IMAGE
    ===================================================== */

    function getProductImage(product) {

        let image =

            product?.image ||
            product?.imageUrl ||
            product?.thumbnail ||
            product?.mainImage;


        /* ---------------------------------------------
           IMAGES ARRAY
        --------------------------------------------- */

        if (
            !image &&
            Array.isArray(product?.images) &&
            product.images.length > 0
        ) {

            image =
                product.images[0];

        }


        /* ---------------------------------------------
           NO IMAGE
        --------------------------------------------- */

        if (!image) {

            return "";

        }


        /* ---------------------------------------------
           OBJECT IMAGE
        --------------------------------------------- */

        if (
            typeof image === "object"
        ) {

            image =
                image.url ||
                image.path ||
                image.src ||
                "";

        }


        image =
            String(image).trim();


        if (!image) {

            return "";

        }


        /* ---------------------------------------------
           DATA / HTTP URL
        --------------------------------------------- */

        if (
            image.startsWith("http://") ||
            image.startsWith("https://") ||
            image.startsWith("data:")
        ) {

            return image;

        }


        /* ---------------------------------------------
           CLEAN PATH
        --------------------------------------------- */

        image =
            image
                .replace(/\\/g, "/")
                .replace(/^\/+/, "");


        /* ---------------------------------------------
           ALREADY UPLOADS PATH
        --------------------------------------------- */

        if (
            image.startsWith("uploads/")
        ) {

            return (
                `${BACKEND_ROOT}/${image}`
            );

        }


        /* ---------------------------------------------
           UPLOAD PATH
        --------------------------------------------- */

        return (
            `${BACKEND_ROOT}/uploads/${image}`
        );

    }


    /* =====================================================
       IMAGE FALLBACK
       NO EXTERNAL PLACEHOLDER
    ===================================================== */

    function createImageFallback(img) {

        if (!img) {
            return;
        }

        img.onerror = null;

        img.style.display = "none";

        const wrapper =
            img.closest(".product-image");

        if (!wrapper) {
            return;
        }

        let fallback =
            wrapper.querySelector(
                ".image-fallback"
            );

        if (fallback) {
            fallback.style.display = "flex";
            return;
        }

        fallback =
            document.createElement("div");

        fallback.className =
            "image-fallback";

        fallback.innerHTML = `
            <span>ZM</span>
            <small>LABEL</small>
        `;

        fallback.style.cssText = `
            position:absolute;
            inset:0;
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            background:#f5f5f5;
            color:#111;
            z-index:1;
        `;

        const logo =
            fallback.querySelector("span");

        logo.style.cssText = `
            font-size:22px;
            font-weight:700;
            letter-spacing:2px;
        `;

        const small =
            fallback.querySelector("small");

        small.style.cssText = `
            margin-top:4px;
            font-size:8px;
            letter-spacing:3px;
            color:#777;
        `;

        wrapper.appendChild(
            fallback
        );

    }


    /* =====================================================
       LOAD PRODUCTS
    ===================================================== */

    async function loadProducts() {

        if (!searchProducts) {

            console.error(
                "ZM LABEL: #searchProducts not found."
            );

            return;

        }


        try {

            searchProducts.classList.add(
                "loading"
            );


            const response =
                await fetch(
                    PRODUCTS_API,
                    {
                        method: "GET",
                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `Products API Error: ${response.status}`
                );

            }


            const data =
                await response.json();


            /* -----------------------------------------
               SUPPORT MULTIPLE API RESPONSE FORMATS
            ----------------------------------------- */

            if (
                Array.isArray(data)
            ) {

                allProducts =
                    data;

            }
            else if (
                Array.isArray(
                    data?.products
                )
            ) {

                allProducts =
                    data.products;

            }
            else if (
                Array.isArray(
                    data?.data
                )
            ) {

                allProducts =
                    data.data;

            }
            else if (
                Array.isArray(
                    data?.results
                )
            ) {

                allProducts =
                    data.results;

            }
            else {

                allProducts = [];

            }


            console.log(
                `ZM LABEL: ${allProducts.length} products loaded.`
            );


            performSearch();

        }
        catch (error) {

            console.error(
                "ZM LABEL Search Error:",
                error
            );

            allProducts = [];

            renderProducts([]);

        }
        finally {

            searchProducts.classList.remove(
                "loading"
            );

        }

    }


    /* =====================================================
       SEARCH HISTORY
    ===================================================== */

    function saveSearch(value) {

        const query =
            String(value || "").trim();


        if (!query) {
            return;
        }


        searchHistory =
            searchHistory.filter(
                item =>
                    normalize(item) !==
                    normalize(query)
            );


        searchHistory.unshift(
            query
        );


        searchHistory =
            searchHistory.slice(
                0,
                8
            );


        localStorage.setItem(
            "zmSearchHistory",
            JSON.stringify(
                searchHistory
            )
        );


        renderHistory();

    }


    /* =====================================================
       RENDER HISTORY
    ===================================================== */

    function renderHistory() {

        if (!historyList) {
            return;
        }


        historyList.innerHTML = "";


        if (
            !searchHistory.length
        ) {

            historyList.innerHTML = `
                <span
                    style="
                        color:#999;
                        font-size:10px;
                        letter-spacing:.4px;
                    "
                >
                    No recent searches
                </span>
            `;

            return;

        }


        searchHistory.forEach(
            query => {

                const item =
                    document.createElement(
                        "button"
                    );


                item.type =
                    "button";


                item.className =
                    "history-item";


                item.innerHTML = `

                    <i
                        class="ri-history-line"
                    ></i>

                    <span>
                        ${escapeHTML(query)}
                    </span>

                `;


                item.addEventListener(
                    "click",
                    () => {

                        if (!searchInput) {
                            return;
                        }


                        searchInput.value =
                            query;


                        currentSearch =
                            query;


                        performSearch();


                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                    }
                );


                historyList.appendChild(
                    item
                );

            }
        );

    }


    /* =====================================================
       CLEAR HISTORY
    ===================================================== */

    if (clearHistory) {

        clearHistory.addEventListener(
            "click",
            () => {

                searchHistory = [];


                localStorage.removeItem(
                    "zmSearchHistory"
                );


                renderHistory();

            }
        );

    }


    /* =====================================================
       SEARCH SUGGESTIONS
    ===================================================== */

    function showSuggestions(value) {

        if (!suggestions) {
            return;
        }


        const query =
            normalize(value);


        suggestions.innerHTML =
            "";


        if (!query) {
            return;
        }


        const matches =
            allProducts
                .filter(product => {

                    const name =
                        normalize(
                            getProductName(
                                product
                            )
                        );


                    const category =
                        getProductCategory(
                            product
                        );


                    const brand =
                        normalize(
                            product?.brand
                        );


                    return (
                        name.includes(query) ||
                        category.includes(query) ||
                        brand.includes(query)
                    );

                })
                .slice(0, 6);


        if (!matches.length) {
            return;
        }


        matches.forEach(
            product => {

                const item =
                    document.createElement(
                        "button"
                    );


                item.type =
                    "button";


                item.className =
                    "suggestion-item";


                item.innerHTML = `

                    <i
                        class="ri-search-line"
                    ></i>

                    <span>
                        ${escapeHTML(
                            getProductName(
                                product
                            )
                        )}
                    </span>

                `;


                item.addEventListener(
                    "click",
                    () => {

                        const name =
                            getProductName(
                                product
                            );


                        searchInput.value =
                            name;


                        currentSearch =
                            name;


                        saveSearch(
                            name
                        );


                        suggestions.innerHTML =
                            "";


                        performSearch();

                    }
                );


                suggestions.appendChild(
                    item
                );

            }
        );

    }


    /* =====================================================
       PERFORM SEARCH
    ===================================================== */

    function performSearch() {

        if (!searchInput) {
            return;
        }


        currentSearch =
            normalize(
                searchInput.value
            );


        let results =
            [...allProducts];


        /* ---------------------------------------------
           TEXT SEARCH
        --------------------------------------------- */

        if (currentSearch) {

            results =
                results.filter(
                    product => {

                        const name =
                            normalize(
                                getProductName(
                                    product
                                )
                            );


                        const category =
                            getProductCategory(
                                product
                            );


                        const brand =
                            normalize(
                                product?.brand
                            );


                        const description =
                            normalize(
                                product?.description
                            );


                        return (

                            name.includes(
                                currentSearch
                            ) ||

                            category.includes(
                                currentSearch
                            ) ||

                            brand.includes(
                                currentSearch
                            ) ||

                            description.includes(
                                currentSearch
                            )

                        );

                    }
                );

        }


        /* ---------------------------------------------
           CATEGORY FILTER
        --------------------------------------------- */

        const selectedCategory =
            normalize(
                categoryFilter?.value ||
                "all"
            );


        if (
            selectedCategory !==
            "all"
        ) {

            results =
                results.filter(
                    product => {

                        const category =
                            getProductCategory(
                                product
                            );


                        const name =
                            normalize(
                                getProductName(
                                    product
                                )
                            );


                        switch (
                            selectedCategory
                        ) {

                            case "hoodies":

                                return (
                                    category.includes(
                                        "hoodie"
                                    ) ||

                                    name.includes(
                                        "hoodie"
                                    )
                                );


                            case "sale":

                                return (
                                    category.includes(
                                        "sale"
                                    ) ||

                                    name.includes(
                                        "sale"
                                    )
                                );


                            case "oversized":

                                return (
                                    category.includes(
                                        "oversized"
                                    ) ||

                                    name.includes(
                                        "oversized"
                                    )
                                );


                            case "bottom":

                                return (

                                    category.includes(
                                        "bottom"
                                    ) ||

                                    category.includes(
                                        "jean"
                                    ) ||

                                    category.includes(
                                        "trouser"
                                    ) ||

                                    category.includes(
                                        "pant"
                                    ) ||

                                    name.includes(
                                        "jean"
                                    ) ||

                                    name.includes(
                                        "trouser"
                                    ) ||

                                    name.includes(
                                        "pant"
                                    )

                                );


                            case "footwear":

                                return (

                                    category.includes(
                                        "footwear"
                                    ) ||

                                    category.includes(
                                        "shoe"
                                    ) ||

                                    category.includes(
                                        "sneaker"
                                    ) ||

                                    name.includes(
                                        "shoe"
                                    ) ||

                                    name.includes(
                                        "sneaker"
                                    )

                                );


                            default:

                                return true;

                        }

                    }
                );

        }


        /* ---------------------------------------------
           SORT
        --------------------------------------------- */

        const selectedSort =
            normalize(
                sortFilter?.value ||
                "default"
            );


        if (
            selectedSort ===
            "low"
        ) {

            results.sort(
                (a, b) =>
                    getProductPrice(a) -
                    getProductPrice(b)
            );

        }


        if (
            selectedSort ===
            "high"
        ) {

            results.sort(
                (a, b) =>
                    getProductPrice(b) -
                    getProductPrice(a)
            );

        }


        renderProducts(
            results
        );

    }


    /* =====================================================
       RENDER PRODUCTS
    ===================================================== */

    function renderProducts(
        products
    ) {

        if (!searchProducts) {
            return;
        }


        searchProducts.innerHTML =
            "";


        /* ---------------------------------------------
           COUNT
        --------------------------------------------- */

        if (searchCount) {

            searchCount.textContent =
                `${products.length} ${
                    products.length === 1
                        ? "Product"
                        : "Products"
                }`;

        }


        /* ---------------------------------------------
           NO RESULT
        --------------------------------------------- */

        if (!products.length) {

            if (noResult) {

                noResult.style.display =
                    "block";

            }

            return;

        }


        if (noResult) {

            noResult.style.display =
                "none";

        }


        /* ---------------------------------------------
           CREATE CARDS
        --------------------------------------------- */

        products.forEach(
            product => {

                searchProducts.appendChild(
                    createProductCard(
                        product
                    )
                );

            }
        );

    }


    /* =====================================================
       PRODUCT CARD
    ===================================================== */

    function createProductCard(
        product
    ) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "product-card";


        const id =
            getProductId(
                product
            );


        const name =
            getProductName(
                product
            );


        const price =
            getProductPrice(
                product
            );


        const image =
            getProductImage(
                product
            );


        const brand =
            product?.brand ||
            "ZM LABEL";


        const badge =
            product?.badge ||
            product?.tag ||
            "";

/* ---------------------------------------------
   DISCOUNT
--------------------------------------------- */

const discount =
    Math.max(
        0,
        Number(
            product?.discount ||
            product?.discountPercent ||
            0
        )
    );


/* ---------------------------------------------
   OLD PRICE
--------------------------------------------- */

let oldPriceHTML = "";
let discountHTML = "";


if (
    discount > 0 &&
    price > 0
) {

    /*
     * Backend price ko original price
     * maana ja raha hai.
     */

    oldPriceHTML = `

        <span
            class="old-price"
        >
            Rs.
            ${price.toLocaleString()}
        </span>

    `;


    discountHTML = `

        <span
            class="discount"
        >
            ${discount}% OFF
        </span>

    `;

}

        /* ---------------------------------------------
           IMAGE
        --------------------------------------------- */

        const imageHTML =
            image
                ? `

                    <img
                        src="${escapeHTML(
                            image
                        )}"
                        alt="${escapeHTML(
                            name
                        )}"
                        loading="lazy"
                        class="product-img"
                    >

                  `
                : `

                    <div
                        class="image-fallback"
                        style="
                            position:absolute;
                            inset:0;
                            display:flex;
                            flex-direction:column;
                            align-items:center;
                            justify-content:center;
                            background:#f5f5f5;
                            color:#111;
                        "
                    >

                        <span
                            style="
                                font-size:22px;
                                font-weight:700;
                                letter-spacing:2px;
                            "
                        >
                            ZM
                        </span>

                        <small
                            style="
                                margin-top:4px;
                                font-size:8px;
                                letter-spacing:3px;
                                color:#777;
                            "
                        >
                            LABEL
                        </small>

                    </div>

                `;


        /* ---------------------------------------------
           CARD HTML
        --------------------------------------------- */

        card.innerHTML = `

            <div
                class="product-image"
            >

                ${imageHTML}


                ${
                    badge
                        ? `

                            <span
                                class="badge"
                            >
                                ${escapeHTML(
                                    badge
                                )}
                            </span>

                          `
                        : ""
                }


                <div
                    class="product-actions"
                >

                    <button
                        type="button"
                        class="search-wishlist-btn"
                        title="Add to Wishlist"
                        aria-label="Add to Wishlist"
                    >

                        <i
                            class="ri-heart-line"
                        ></i>

                    </button>


                    <button
                        type="button"
                        class="quick-view-btn"
                        title="View Product"
                        aria-label="View Product"
                    >

                        <i
                            class="ri-eye-line"
                        ></i>

                    </button>

                </div>

            </div>


            <div
                class="product-info"
            >

                <span
                    class="product-brand"
                >
                    ${escapeHTML(
                        brand
                    )}
                </span>


                <span
                    class="product-name"
                >
                    ${escapeHTML(
                        name
                    )}
                </span>


                <div
    class="product-price"
>

    <span
        class="new-price"
    >
        Rs.
        ${price.toLocaleString()}
    </span>

    ${oldPriceHTML}

    ${discountHTML}

</div>

            </div>

        `;


        /* ---------------------------------------------
           IMAGE ERROR
        --------------------------------------------- */

        const img =
            card.querySelector(
                ".product-img"
            );


        if (img) {

            img.addEventListener(
                "error",
                () => {

                    createImageFallback(
                        img
                    );

                }
            );

        }


        /* ---------------------------------------------
           PRODUCT CLICK
        --------------------------------------------- */

        card.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        ".product-actions"
                    )
                ) {

                    return;

                }


                openProduct(
                    product
                );

            }
        );


        /* ---------------------------------------------
           WISHLIST
        --------------------------------------------- */

        const wishlistBtn =
            card.querySelector(
                ".search-wishlist-btn"
            );


        if (wishlistBtn) {

            wishlistBtn.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    addToWishlist(
                        product
                    );

                }
            );

        }


        /* ---------------------------------------------
           QUICK VIEW
        --------------------------------------------- */

        const quickView =
            card.querySelector(
                ".quick-view-btn"
            );


        if (quickView) {

            quickView.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    openProduct(
                        product
                    );

                }
            );

        }


        return card;

    }


    /* =====================================================
       OPEN PRODUCT
    ===================================================== */

    function openProduct(
        product
    ) {

        const id =
            getProductId(
                product
            );


        if (!id) {

            console.warn(
                "ZM LABEL: Product ID missing.",
                product
            );

            return;

        }


        window.location.href =
            `product.html?id=${encodeURIComponent(
                id
            )}`;

    }


    /* =====================================================
       WISHLIST
    ===================================================== */

    function addToWishlist(
        product
    ) {

        try {

            let wishlist =
                JSON.parse(
                    localStorage.getItem(
                        "wishlist"
                    ) || "[]"
                );


            if (!Array.isArray(
                wishlist
            )) {

                wishlist = [];

            }


            const id =
                getProductId(
                    product
                );


            if (!id) {

                showToast(
                    "Product unavailable"
                );

                return;

            }


            const exists =
                wishlist.some(
                    item => {

                        const itemId =
                            item?._id ||
                            item?.id ||
                            item?.productId ||
                            "";


                        return (
                            String(
                                itemId
                            ) ===
                            String(
                                id
                            )
                        );

                    }
                );


            if (exists) {

                showToast(
                    "Already in Wishlist"
                );

                return;

            }


            wishlist.push(
                product
            );


            localStorage.setItem(
                "wishlist",
                JSON.stringify(
                    wishlist
                )
            );


            updateWishlistCount();


            showToast(
                "Added to Wishlist"
            );

        }
        catch (error) {

            console.error(
                "ZM LABEL Wishlist Error:",
                error
            );

        }

    }


    /* =====================================================
       WISHLIST COUNT
    ===================================================== */

    function updateWishlistCount() {

        const count =
            document.getElementById(
                "wishlistCount"
            );


        if (!count) {
            return;
        }


        try {

            const wishlist =
                JSON.parse(
                    localStorage.getItem(
                        "wishlist"
                    ) || "[]"
                );


            count.textContent =
                Array.isArray(wishlist)
                    ? wishlist.length
                    : 0;

        }
        catch {

            count.textContent =
                "0";

        }

    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(
        message
    ) {

        let toast =
            document.getElementById(
                "zmSearchToast"
            );


        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );


            toast.id =
                "zmSearchToast";


            toast.style.cssText = `

                position:fixed;

                left:50%;
                bottom:30px;

                transform:
                    translate(-50%,20px);

                z-index:99999;

                padding:
                    13px 22px;

                background:#111;

                color:#fff;

                font-family:
                    Montserrat,
                    sans-serif;

                font-size:10px;

                font-weight:600;

                letter-spacing:.7px;

                opacity:0;

                pointer-events:none;

                transition:
                    opacity .25s ease,
                    transform .25s ease;

            `;


            document.body.appendChild(
                toast
            );

        }


        toast.textContent =
            message;


        requestAnimationFrame(
            () => {

                toast.style.opacity =
                    "1";


                toast.style.transform =
                    "translate(-50%,0)";

            }
        );


        clearTimeout(
            toast._timer
        );


        toast._timer =
            setTimeout(
                () => {

                    toast.style.opacity =
                        "0";


                    toast.style.transform =
                        "translate(-50%,20px)";

                },
                1800
            );

    }


    /* =====================================================
       SEARCH INPUT
    ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                showSuggestions(
                    searchInput.value
                );


                performSearch();

            }
        );


        searchInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    const value =
                        searchInput.value
                            .trim();


                    if (value) {

                        saveSearch(
                            value
                        );

                    }


                    if (suggestions) {

                        suggestions.innerHTML =
                            "";

                    }


                    performSearch();

                }

            }
        );

    }


    /* =====================================================
       CLEAR SEARCH
    ===================================================== */

    if (clearSearch) {

        clearSearch.addEventListener(
            "click",
            () => {

                if (!searchInput) {
                    return;
                }


                searchInput.value =
                    "";


                currentSearch =
                    "";


                if (suggestions) {

                    suggestions.innerHTML =
                        "";

                }


                performSearch();


                searchInput.focus();

            }
        );

    }


    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            performSearch
        );

    }


    /* =====================================================
       SORT FILTER
    ===================================================== */

    if (sortFilter) {

        sortFilter.addEventListener(
            "change",
            performSearch
        );

    }


    /* =====================================================
       TRENDING SEARCHES
    ===================================================== */

    trendTags.forEach(
        tag => {

            tag.addEventListener(
                "click",
                () => {

                    if (!searchInput) {
                        return;
                    }


                    const value =
                        tag.textContent
                            .trim();


                    searchInput.value =
                        value;


                    currentSearch =
                        value;


                    saveSearch(
                        value
                    );


                    performSearch();


                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }
            );

        }
    );


    /* =====================================================
       CLICK OUTSIDE SUGGESTIONS
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            if (
                suggestions &&
                searchInput &&
                !suggestions.contains(
                    event.target
                ) &&
                !searchInput.contains(
                    event.target
                )
            ) {

                suggestions.innerHTML =
                    "";

            }

        }
    );


    /* =====================================================
       ESCAPE
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                if (suggestions) {

                    suggestions.innerHTML =
                        "";

                }


                if (searchInput) {

                    searchInput.blur();

                }

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    renderHistory();

    updateWishlistCount();

    loadProducts();

});