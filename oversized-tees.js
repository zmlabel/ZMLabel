/* ==========================================
ZM LABEL
OVERSIZED TEES PAGE
BACKEND
========================================== */

const API_URL = "http://localhost:5000/api/products";


let allProducts = [];
let filteredProducts = [];


/* ==========================================
PAGE LOAD
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadProducts();

    setupMobileMenu();

    setupFilterSidebar();

    loadWishlistCount();

});


/* ==========================================
LOAD PRODUCTS
========================================== */

async function loadProducts() {

    try {

        const res = await fetch(API_URL);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        console.log("Products Response:", data);


        /* ==========================================
        GET PRODUCTS ARRAY
        ========================================== */

        const products =
            Array.isArray(data)
                ? data
                : Array.isArray(data.products)
                    ? data.products
                    : Array.isArray(data.data)
                        ? data.data
                        : [];


        console.log(
            "All Products:",
            products
        );


        /* ==========================================
        ONLY OVERSIZED TEES PRODUCTS
        ========================================== */

        allProducts = products.filter(product => {

            const category =
                String(
                    product.category || ""
                ).trim();

            return category === "Oversizzed-tees";

        });


        console.log(
            "Oversized Tees Products:",
            allProducts
        );


        /* ==========================================
        INITIAL PRODUCTS
        ========================================== */

        filteredProducts = [
            ...allProducts
        ];


        /* ==========================================
        RENDER
        ========================================== */

        renderProducts(
            filteredProducts
        );


        updateProductCount();


    }

    catch (error) {

        console.error(
            "Products Load Error:",
            error
        );


        const container =
            document.getElementById(
                "productsContainer"
            );


        if (container) {

            container.innerHTML = `

                <div class="no-products">

                    Failed To Load Products

                </div>

            `;

        }

    }

}

/* ==========================================
RENDER PRODUCTS
========================================== */

function renderProducts(products) {

    console.log(
        "Rendering Products:",
        products
    );


    const container =
        document.getElementById(
            "productsContainer"
        );


    if (!container) return;


    container.innerHTML = "";


    /* ==========================================
    NO PRODUCTS
    ========================================== */

    if (
        !products ||
        products.length === 0
    ) {

        container.innerHTML = `
            <div class="no-products">
                No Oversized Tees Found.
            </div>
        `;

        return;

    }


    /* ==========================================
    PRODUCT LOOP
    ========================================== */

    products.forEach(product => {


        /* ==========================================
        PRICE
        ========================================== */

        const oldPrice =
            Number(product.price) || 0;


        const discount =
            Number(product.discount) || 0;


        const newPrice =
            Math.round(
                oldPrice -
                (
                    oldPrice *
                    discount /
                    100
                )
            );


        /* ==========================================
        IMAGE
        ========================================== */

        const imageURL =
            product.image
                ? `${IMAGE_URL}uploads/${product.image}`
                : "images/placeholder.jpg";


        /* ==========================================
        BADGE
        ========================================== */

        const badgeHTML =
            product.badge
                ? `
                    <span
                        class="product-badge ${String(
                            product.badge
                        ).toLowerCase()}"
                    >
                        ${product.badge}
                    </span>
                `
                : "";


        /* ==========================================
        PRICE HTML
        ========================================== */

        const priceHTML = `

            <div class="product-price">

                <span class="current-price">
                    Rs.${newPrice.toLocaleString()}
                </span>


                ${
                    discount > 0
                    ? `

                        <span class="old-price">
                            Rs.${oldPrice.toLocaleString()}
                        </span>


                        <span class="discount">
                            ${discount}% OFF
                        </span>

                    `
                    : ""
                }

            </div>

        `;


        /* ==========================================
        PRODUCT CARD
        SAME STRUCTURE AS HOODIES PAGE
        ========================================== */

        container.innerHTML += `

            <div class="product-card">


                <!-- PRODUCT IMAGE -->

                <div class="product-image">


                    ${badgeHTML}


                    <!-- WISHLIST -->

                    <button
                        class="wishlist-btn"
                        id="wishlist-${product._id}"
                        onclick="toggleWishlist('${product._id}')"
                        aria-label="Add to Wishlist"
                    >

                        <i class="ri-heart-line"></i>

                    </button>


                    <!-- IMAGE -->

                    <img
                        src="${imageURL}"
                        alt="${product.name || "Oversized Tee"}"
                        loading="lazy"
                    >


                </div>


                <!-- PRODUCT INFO -->

                <div class="product-info">


                    <!-- BRAND -->

                    <div class="product-brand">

                        ${product.brand || "ZM LABEL"}

                    </div>


                    <!-- NAME -->

                    <h3 class="product-name">

                        ${product.name || "Oversized Tee"}

                    </h3>


                    <!-- PRICE -->

                    ${priceHTML}


                    <!-- VIEW DETAILS -->

                    <button
                        class="view-btn"
                        onclick="openProduct('${product._id}')"
                    >

                        View Details

                    </button>


                </div>


            </div>

        `;

    });

}



/* ==========================================
PRODUCT COUNT
========================================== */

function updateProductCount() {

    const count =
        document.getElementById(
            "productCount"
        );


    if (!count) return;


    count.innerText =
        filteredProducts.length +
        " Products";

}



/* ==========================================
PRODUCT DETAILS
========================================== */

function openProduct(id) {

    window.location.href =
        `product.html?id=${id}`;

}


/* ==========================================
SORT PRODUCTS
========================================== */

function setupSorting() {

    const sortSelect =
        document.getElementById(
            "sortProducts"
        );


    if (!sortSelect) return;


    sortSelect.addEventListener(
        "change",
        () => {


            const value =
                sortSelect.value;


            let products =
                [...filteredProducts];


            switch (value) {


                /* ==================================
                PRICE LOW → HIGH
                ================================== */

                case "priceLow":

                    products.sort(
                        (a, b) => {

                            const aPrice =
                                calculateDiscount(
                                    a.price,
                                    a.discount
                                );


                            const bPrice =
                                calculateDiscount(
                                    b.price,
                                    b.discount
                                );


                            return (
                                aPrice -
                                bPrice
                            );

                        }
                    );

                    break;


                /* ==================================
                PRICE HIGH → LOW
                ================================== */

                case "priceHigh":

                    products.sort(
                        (a, b) => {

                            const aPrice =
                                calculateDiscount(
                                    a.price,
                                    a.discount
                                );


                            const bPrice =
                                calculateDiscount(
                                    b.price,
                                    b.discount
                                );


                            return (
                                bPrice -
                                aPrice
                            );

                        }
                    );

                    break;


                /* ==================================
                NAME A → Z
                ================================== */

                case "nameAZ":

                    products.sort(
                        (a, b) =>

                            String(
                                a.name || ""
                            ).localeCompare(
                                String(
                                    b.name || ""
                                )
                            )
                    );

                    break;


                /* ==================================
                NAME Z → A
                ================================== */

                case "nameZA":

                    products.sort(
                        (a, b) =>

                            String(
                                b.name || ""
                            ).localeCompare(
                                String(
                                    a.name || ""
                                )
                            )
                    );

                    break;


                /* ==================================
                NEWEST
                ================================== */

                default:

                    products =
                        [...filteredProducts];

                    break;

            }


            renderProducts(products);

        }
    );

}


/* ==========================================
FILTER SIDEBAR
LEFT SIDE OPEN
========================================== */

function setupFilterSidebar() {


    const filterBtn =
        document.getElementById(
            "filterBtn"
        );


    const sidebar =
        document.getElementById(
            "filterSidebar"
        );


    const overlay =
        document.getElementById(
            "filterOverlay"
        );


    const closeBtn =
        document.getElementById(
            "closeFilter"
        );


    if (
        !filterBtn ||
        !sidebar ||
        !overlay
    ) {

        console.log(
            "Filter sidebar elements not found."
        );

        return;

    }


    /* ==========================================
    OPEN SIDEBAR
    ========================================== */

    filterBtn.addEventListener(
        "click",
        () => {

            sidebar.classList.add(
                "active"
            );


            overlay.classList.add(
                "active"
            );


            document.body.classList.add(
                "filter-open"
            );

        }
    );


    /* ==========================================
    CLOSE SIDEBAR
    ========================================== */

    if (closeBtn) {

        closeBtn.addEventListener(
            "click",
            closeFilter
        );

    }


    /* ==========================================
    OVERLAY CLICK
    ========================================== */

    overlay.addEventListener(
        "click",
        closeFilter
    );


    /* ==========================================
    CLOSE FUNCTION
    ========================================== */

    function closeFilter() {

        sidebar.classList.remove(
            "active"
        );


        overlay.classList.remove(
            "active"
        );


        document.body.classList.remove(
            "filter-open"
        );

    }


    /* ==========================================
    APPLY FILTER
    ========================================== */

    const apply =
        document.getElementById(
            "applyFilter"
        );


    if (apply) {

        apply.addEventListener(
            "click",
            () => {


                /* ==================================
                SELECT SUB CATEGORY
                ================================== */

                const selectedSub =
                    document.querySelector(
                        'input[name="subCategory"]:checked'
                    );


                /* ==================================
                SELECT PRICE
                ================================== */

                const selectedPrice =
                    document.querySelector(
                        'input[name="price"]:checked'
                    );


                /* ==================================
                START WITH OVERSIZED PRODUCTS
                ================================== */

                let results = [...allProducts];

                


                /* ==================================
                SUB CATEGORY FILTER
                ================================== */

                if (selectedSub) {

                    const selectedValue =
                        selectedSub.value
                            .toLowerCase()
                            .trim();


                    results =
                        results.filter(
                            product => {


                                const productSub =
                                    String(
                                        product.subCategory || ""
                                    )
                                    .toLowerCase()
                                    .trim();


                                return (
                                    productSub ===
                                    selectedValue
                                );

                            }
                        );

                }


                /* ==================================
                PRICE FILTER
                ================================== */

                if (selectedPrice) {


                    const priceRange =
                        selectedPrice.value;


                    results =
                        results.filter(
                            product => {


                                const price =
                                    Number(
                                        product.price || 0
                                    );


                                const discount =
                                    Number(
                                        product.discount || 0
                                    );


                                const finalPrice =
                                    calculateDiscount(
                                        price,
                                        discount
                                    );


                                /* BELOW 3000 */

                                if (
                                    priceRange ===
                                    "0-3000"
                                ) {

                                    return (
                                        finalPrice < 3000
                                    );

                                }


                                /* 3000 - 5000 */

                                if (
                                    priceRange ===
                                    "3000-5000"
                                ) {

                                    return (
                                        finalPrice >= 3000 &&
                                        finalPrice <= 5000
                                    );

                                }


                                /* ABOVE 5000 */

                                if (
                                    priceRange ===
                                    "5000+"
                                ) {

                                    return (
                                        finalPrice > 5000
                                    );

                                }


                                return true;

                            }
                        );

                }


                /* ==================================
                SAVE FILTERED PRODUCTS
                ================================== */

                filteredProducts =
                    results;


                /* ==================================
                RENDER
                ================================== */

                renderProducts(
                    filteredProducts
                );


                updateProductCount();


                /* ==================================
                CLOSE SIDEBAR
                ================================== */

                closeFilter();

            }
        );

    }

}


/* ==========================================
MOBILE MENU
========================================== */

function setupMobileMenu() {


    const btn =
        document.getElementById(
            "menuBtn"
        );


    const menu =
        document.getElementById(
            "mobileMenu"
        );


    if (
        !btn ||
        !menu
    ) {

        return;

    }


    btn.addEventListener(
        "click",
        () => {

            menu.classList.toggle(
                "active"
            );

        }
    );

}


/* ==========================================
CALCULATE DISCOUNT
========================================== */

function calculateDiscount(
    price,
    discount
) {

    price =
        Number(price) || 0;


    discount =
        Number(discount) || 0;


    return Math.round(

        price -
        (
            price *
            discount /
            100
        )

    );

}


/* ==========================================
FORMAT PRICE
========================================== */

function formatPrice(price) {

    return (
        "Rs." +
        Number(price || 0)
            .toLocaleString()
    );

}


/* ==========================================
REFRESH PRODUCTS
========================================== */

function refreshProducts() {

    renderProducts(
        filteredProducts
    );

    updateProductCount();

}


/* ==========================================
WINDOW RESIZE
========================================== */

window.addEventListener(
    "resize",
    () => {


        const menu =
            document.getElementById(
                "mobileMenu"
            );


        if (
            window.innerWidth > 992 &&
            menu
        ) {

            menu.classList.remove(
                "active"
            );

        }

    }
);


/* ==========================================
WISHLIST
========================================== */

async function toggleWishlist(
    productId
) {

    try {


        const token =
            localStorage.getItem(
                "token"
            );


        if (!token) {

            window.location.href =
                "login.html";

            return;

        }


        const response =
            await fetch(
                "http://localhost:5000/api/wishlist",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            productId:
                                productId

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "Wishlist Response:",
            data
        );


        if (data.success) {


            const btn =
                document.getElementById(
                    `wishlist-${productId}`
                );


            if (btn) {


                const icon =
                    btn.querySelector(
                        "i"
                    );


                if (
                    data.action ===
                    "added"
                ) {

                    btn.classList.add(
                        "active"
                    );


                    if (icon) {

                        icon.className =
                            "ri-heart-fill";

                    }


                    showToast(
                        "❤️ Product added to Wishlist"
                    );

                }


                if (
                    data.action ===
                    "removed"
                ) {

                    btn.classList.remove(
                        "active"
                    );


                    if (icon) {

                        icon.className =
                            "ri-heart-line";

                    }


                    showToast(
                        "💔 Product removed from Wishlist"
                    );

                }

            }


            loadWishlistCount();

        }

        else {

            alert(
                data.message
            );

        }

    }

    catch (error) {

        console.error(
            "Wishlist Error:",
            error
        );

    }

}


/* ==========================================
LOAD WISHLIST COUNT
========================================== */

async function loadWishlistCount() {

    try {


        const badge =
            document.getElementById(
                "wishlistCount"
            );


        if (!badge) return;


        const token =
            localStorage.getItem(
                "token"
            );


        if (!token) {

            badge.innerText =
                "0";

            return;

        }


        const response =
            await fetch(
                "http://localhost:5000/api/wishlist",
                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        console.log(
            "Wishlist Count Response:",
            data
        );


        if (
            data.success &&
            Array.isArray(
                data.products
            )
        ) {

            badge.innerText =
                data.products.length;

        }

        else {

            badge.innerText =
                "0";

        }

    }

    catch (error) {

        console.error(
            "Wishlist Count Error:",
            error
        );

    }

}


/* ==========================================
TOAST
========================================== */

function showToast(message) {


    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) return;


    toast.innerText =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2000
    );

}


/* ==========================================
INITIAL SORT SETUP
========================================== */

setupSorting();


/* ==========================================
PAGE LOADED
========================================== */

console.log(
    "✅ Oversized Tees Page Loaded Successfully"
);