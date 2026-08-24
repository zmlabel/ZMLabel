/* =========================================================
   ZM LABEL — MAIN.JS
   HOMEPAGE
   HERO + LATEST COLLECTION + ZM EDIT
   NEWSLETTER + WISHLIST + CAROUSEL
========================================================= */


/* =========================================================
   API
========================================================= */

const API =
    "http://localhost:5000/api";

const IMAGE_URL =
    "http://localhost:5000/";


/* =========================================================
   HERO SLIDER
========================================================= */

const slides =
    document.querySelectorAll(".slide");

const dots =
    document.querySelectorAll(".dot");

let currentSlide = 0;


function showSlide(index) {

    if (!slides.length) {
        return;
    }


    slides.forEach(slide => {

        slide.classList.remove(
            "active"
        );

    });


    dots.forEach(dot => {

        dot.classList.remove(
            "active"
        );

    });


    if (slides[index]) {

        slides[index].classList.add(
            "active"
        );

    }


    if (dots[index]) {

        dots[index].classList.add(
            "active"
        );

    }

}


function nextSlide() {

    if (!slides.length) {
        return;
    }


    currentSlide++;


    if (
        currentSlide >=
        slides.length
    ) {

        currentSlide = 0;

    }


    showSlide(
        currentSlide
    );

}


if (slides.length) {

    showSlide(0);

    setInterval(
        nextSlide,
        4000
    );

}


dots.forEach(
    (dot, index) => {

        dot.addEventListener(
            "click",
            () => {

                currentSlide =
                    index;

                showSlide(
                    currentSlide
                );

            }
        );

    }
);


/* =========================================================
   HELPERS
========================================================= */

function getProductId(
    product
) {

    return String(
        product?._id ||
        product?.id ||
        ""
    );

}


function getImage(
    product
) {

    if (
        !product?.image
    ) {

        return "images/placeholder.jpg";

    }


    return (
        `${IMAGE_URL}uploads/` +
        product.image
    );

}


/* =========================================================
   WISHLIST
========================================================= */

function getWishlistToken() {

    return localStorage.getItem(
        "token"
    );

}


/* =========================================================
   GET WISHLIST PRODUCTS
========================================================= */

async function getWishlistProducts() {

    const token =
        getWishlistToken();


    if (!token) {

        return [];

    }


    try {

        const response =
            await fetch(
                `${API}/wishlist`,
                {
                    method: "GET",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        if (!response.ok) {

            return [];

        }


        const data =
            await response.json();


        if (
            data &&
            Array.isArray(
                data.products
            )
        ) {

            return data.products;

        }


        return [];

    }
    catch (error) {

        console.error(
            "Wishlist Load Error:",
            error
        );


        return [];

    }

}


/* =========================================================
   WISHLIST HEART STATE
========================================================= */

function setWishlistButtonState(
    productId,
    active
) {

    if (!productId) {

        return;

    }


    const id =
        String(productId);


    const buttons =
        document.querySelectorAll(
            `[data-wishlist-id="${id}"], #wishlist-${id}`
        );


    buttons.forEach(
        button => {

            const icon =
                button.querySelector(
                    "i"
                );


            if (active) {

                button.classList.add(
                    "active",
                    "is-wishlisted"
                );


                button.setAttribute(
                    "aria-label",
                    "Remove from wishlist"
                );


                if (icon) {

                    icon.classList.remove(
                        "ri-heart-line"
                    );


                    icon.classList.add(
                        "ri-heart-fill"
                    );


                    icon.style.color =
                        "#e11d2e";

                }


                button.style.color =
                    "#e11d2e";

            }
            else {

                button.classList.remove(
                    "active",
                    "is-wishlisted"
                );


                button.setAttribute(
                    "aria-label",
                    "Add to wishlist"
                );


                if (icon) {

                    icon.classList.remove(
                        "ri-heart-fill"
                    );


                    icon.classList.add(
                        "ri-heart-line"
                    );


                    icon.style.color =
                        "";

                }


                button.style.color =
                    "";

            }

        }
    );

}


/* =========================================================
   SYNC WISHLIST BUTTONS
========================================================= */

async function syncWishlistButtons() {

    const token =
        getWishlistToken();


    if (!token) {

        document
            .querySelectorAll(
                "[data-wishlist-id]"
            )
            .forEach(
                button => {

                    button.classList.remove(
                        "active",
                        "is-wishlisted"
                    );


                    const icon =
                        button.querySelector(
                            "i"
                        );


                    if (icon) {

                        icon.classList.remove(
                            "ri-heart-fill"
                        );


                        icon.classList.add(
                            "ri-heart-line"
                        );


                        icon.style.color =
                            "";

                    }


                    button.style.color =
                        "";

                }
            );


        return;

    }


    const wishlist =
        await getWishlistProducts();


    wishlist.forEach(
        item => {

            const product =
                item?.product ||
                item;


            const id =
                String(
                    product?._id ||
                    product?.id ||
                    item?._id ||
                    item?.productId ||
                    ""
                );


            if (id) {

                setWishlistButtonState(
                    id,
                    true
                );

            }

        }
    );

}


/* =========================================================
   TOGGLE WISHLIST
========================================================= */

async function toggleWishlist(
    productId
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


    if (!productId) {

        console.error(
            "Wishlist: Product ID missing"
        );

        return;

    }


    const id =
        String(productId);


    try {

        const response =
            await fetch(
                `${API}/wishlist`,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            productId:
                                id

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "Wishlist Response:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            showToast(
                data.message ||
                "Unable to update wishlist."
            );

            return;

        }


        if (
            data.action ===
            "added"
        ) {

            setWishlistButtonState(
                id,
                true
            );


            showToast(
                "❤️ Product added to Wishlist"
            );

        }


        else if (
            data.action ===
            "removed"
        ) {

            setWishlistButtonState(
                id,
                false
            );


            showToast(
                "💔 Product removed from Wishlist"
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
            "Unable to update wishlist."
        );

    }

}


window.toggleWishlist =
    toggleWishlist;


/* =========================================================
   LATEST COLLECTION
========================================================= */

async function loadProducts() {

    const container =
        document.getElementById(
            "productsContainer"
        );


    if (!container) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API}/products`
            );


        if (!response.ok) {

            throw new Error(
                `Products API Error: ${response.status}`
            );

        }


        const data =
            await response.json();


        const allProducts =
            Array.isArray(
                data.products
            )
                ? data.products
                : [];


        /*
         * REMOVE DUPLICATES
         */

        const uniqueProducts =
            Array.from(
                new Map(
                    allProducts.map(
                        product => [

                            getProductId(
                                product
                            ),

                            product

                        ]
                    )
                ).values()
            );


        /*
         * ONLY ACTIVE + HOMEPAGE
         */

        const products =
            uniqueProducts
                .filter(
                    product => {

                        return (

                            product.status ===
                                "Active"

                            &&

                            product.showOnHome ===
                                true

                        );

                    }
                )
                .slice(
                    0,
                    8
                );


        console.log(
            "Latest Collection Products:",
            products
        );


        if (!products.length) {

            container.innerHTML = `
                <div class="no-products">
                    No Latest Collection Products Found.
                </div>
            `;

            return;

        }


        container.innerHTML =
            "";


        products.forEach(
            product => {

                const productId =
                    getProductId(
                        product
                    );


                const price =
                    Number(
                        product.price ||
                        0
                    );


                const discount =
                    Number(
                        product.discount ||
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


                const image =
                    getImage(
                        product
                    );


                let badgeHTML =
                    "";


                if (
                    product.badge
                ) {

                    badgeHTML = `
                        <span class="product-badge">
                            ${product.badge}
                        </span>
                    `;

                }
                else if (
                    discount > 0
                ) {

                    badgeHTML = `
                        <span class="product-badge">
                            SALE
                        </span>
                    `;

                }


                let priceHTML =
                    "";


                if (
                    discount > 0
                ) {

                    priceHTML = `
                        <div class="product-price">

                            <span class="current-price">
                                Rs. ${finalPrice.toLocaleString()}
                            </span>

                            <span class="old-price">
                                Rs. ${price.toLocaleString()}
                            </span>

                            <span class="discount">
                                ${discount}% OFF
                            </span>

                        </div>
                    `;

                }
                else {

                    priceHTML = `
                        <div class="product-price">

                            <span class="current-price">
                                Rs. ${price.toLocaleString()}
                            </span>

                        </div>
                    `;

                }


                container.insertAdjacentHTML(
                    "beforeend",
                    `

                    <article
                        class="product-card"
                        data-product-id="${productId}"
                    >

                        <div class="product-image">

                            ${badgeHTML}

                            <button
                                type="button"
                                class="product-wishlist wishlist-btn"
                                data-wishlist-id="${productId}"
                                onclick="event.preventDefault(); event.stopPropagation(); toggleWishlist('${productId}')"
                                aria-label="Add to wishlist"
                            >

                                <i class="ri-heart-line"></i>

                            </button>


                            <img
                                src="${image}"
                                alt="${product.name || "ZM LABEL Product"}"
                                loading="lazy"
                                onerror="this.onerror=null; this.src='images/placeholder.jpg';"
                            >

                        </div>


                        <div class="product-info">

                            <p class="product-category">
                                ${product.category || "ZM LABEL"}
                            </p>


                            <h3 class="product-title">
                                ${product.name || "Product"}
                            </h3>


                            ${priceHTML}


                            <div class="product-actions">

                                <a
                                    href="product.html?id=${productId}"
                                    class="view-btn"
                                >
                                    View Details
                                </a>

                            </div>

                        </div>

                    </article>

                    `
                );

            }
        );


        syncWishlistButtons();

    }
    catch (error) {

        console.error(
            "Homepage Products Error:",
            error
        );


        container.innerHTML = `
            <div class="no-products">
                Unable to load products.
            </div>
        `;

    }

}


/* =========================================================
   ZM EDIT CONFIG
========================================================= */

const ZM_EDIT_API =
    `${API}/products`;

const ZM_EDIT_IMAGE_URL =
    IMAGE_URL;


/* =========================================================
   ZM EDIT ANIMATION STATE
========================================================= */

let zmEditAnimationFrame =
    null;

let zmEditRunning =
    false;


/* =========================================================
   STOP ZM EDIT ANIMATION
========================================================= */

function stopZMEditAnimation() {

    zmEditRunning =
        false;


    if (
        zmEditAnimationFrame
    ) {

        cancelAnimationFrame(
            zmEditAnimationFrame
        );

        zmEditAnimationFrame =
            null;

    }

}


/* =========================================================
   START ZM EDIT ANIMATION
   SAME STYLE AS ORIGINAL MAIN.JS
========================================================= */

function startZMEditAnimation() {

    const container =
        document.getElementById(
            "floatingProducts"
        );


    if (!container) {

        return;

    }


    stopZMEditAnimation();


    /*
     * CSS animation is used.
     * No requestAnimationFrame movement.
     */

    container.style.animation =
        "none";


    container.style.display =
        "flex";


    container.style.flexWrap =
        "nowrap";


    container.style.width =
        "max-content";


    container.style.maxWidth =
        "none";


    container.style.flex =
        "0 0 max-content";


    container.style.transform =
        "translate3d(0,0,0)";


    container.style.willChange =
        "transform";


    /*
     * CARDS
     */

    container
        .querySelectorAll(
            ".zm-floating-card"
        )
        .forEach(
            card => {

                card.style.flexShrink =
                    "0";

            }
        );


    /*
     * FORCE REFLOW
     */

    void container.offsetWidth;


    /*
     * START INFINITE ANIMATION
     */

    container.style.animation =
        "zmInfiniteProducts 35s linear infinite";

}


/* =========================================================
   LOAD ZM EDIT PRODUCTS
========================================================= */

async function loadZMEditProducts() {

    const container =
        document.getElementById(
            "floatingProducts"
        );


    if (!container) {

        return;

    }


    stopZMEditAnimation();


    try {

        const response =
            await fetch(
                ZM_EDIT_API
            );


        if (!response.ok) {

            throw new Error(
                `ZM Edit API Error: ${response.status}`
            );

        }


        const data =
            await response.json();


        const products =
            Array.isArray(
                data.products
            )
                ? data.products
                : [];


        /*
         * ONLY ZM EDIT
         */

        const zmEditProducts =
            products.filter(
                product => {

                    const subCategory =
                        String(
                            product.subCategory ||
                            ""
                        )
                            .trim()
                            .toLowerCase();


                    return (
                        subCategory ===
                        "zm edit"
                    );

                }
            );


        /*
         * REMOVE DUPLICATE IDs
         */

        const uniqueProducts =
            Array.from(
                new Map(
                    zmEditProducts.map(
                        product => [

                            getProductId(
                                product
                            ),

                            product

                        ]
                    )
                ).values()
            );


        console.log(
            "ZM Edit Products:",
            uniqueProducts
        );


        if (
            !uniqueProducts.length
        ) {

            container.innerHTML =
                "";

            return;

        }


        /*
         * CREATE ONE PRODUCT SET
         */

        const productHTML =
            uniqueProducts
                .map(
                    product => {

                        const productId =
                            getProductId(
                                product
                            );


                        const price =
                            Number(
                                product.price ||
                                0
                            );


                        const discount =
                            Number(
                                product.discount ||
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


                        const image =
                            product.image
                                ? `${ZM_EDIT_IMAGE_URL}uploads/${product.image}`
                                : "images/placeholder.jpg";


                        let badgeHTML =
                            "";


                        if (
                            product.badge
                        ) {

                            badgeHTML = `
                                <span class="zm-floating-badge">
                                    ${product.badge}
                                </span>
                            `;

                        }
                        else if (
                            discount > 0
                        ) {

                            badgeHTML = `
                                <span class="zm-floating-badge sale-badge">
                                    SALE
                                </span>
                            `;

                        }


                        let priceHTML =
                            "";


                        if (
                            discount > 0
                        ) {

                            priceHTML = `
                                <div class="zm-floating-price">

                                    <span class="zm-current-price">
                                        Rs. ${finalPrice.toLocaleString()}
                                    </span>

                                    <span class="zm-old-price">
                                        Rs. ${price.toLocaleString()}
                                    </span>

                                    <span class="zm-discount">
                                        ${discount}% OFF
                                    </span>

                                </div>
                            `;

                        }
                        else {

                            priceHTML = `
                                <div class="zm-floating-price">

                                    <span class="zm-current-price">
                                        Rs. ${price.toLocaleString()}
                                    </span>

                                </div>
                            `;

                        }


                        return `

                            <article
                                class="zm-floating-card"
                                data-product-id="${productId}"
                            >

                                <div
                                    class="zm-floating-image"
                                >

                                    ${badgeHTML}


                                    <button
                                        type="button"
                                        id="wishlist-${productId}"
                                        class="zm-floating-wishlist"
                                        data-wishlist-id="${productId}"
                                        onclick="event.preventDefault(); event.stopPropagation(); toggleWishlist('${productId}')"
                                        aria-label="Add to wishlist"
                                    >

                                        <i
                                            class="ri-heart-line"
                                        ></i>

                                    </button>


                                    <img
                                        src="${image}"
                                        alt="${product.name || "ZM LABEL Product"}"
                                        loading="lazy"
                                        onerror="
                                            this.onerror=null;
                                            this.src='images/placeholder.jpg';
                                        "
                                    >

                                </div>


                                <div
                                    class="zm-floating-info"
                                >

                                    <div
                                        class="zm-floating-brand"
                                    >
                                        ${product.brand || "ZM LABEL"}
                                    </div>


                                    <h3
                                        class="zm-floating-name"
                                    >
                                        ${product.name || "Product"}
                                    </h3>


                                    ${priceHTML}


                                    <a
                                        href="product.html?id=${productId}"
                                        class="zm-floating-view"
                                    >
                                        View Details
                                    </a>

                                </div>

                            </article>

                        `;

                    }
                )
                .join("");


        /*
         * IMPORTANT:
         *
         * DUPLICATE THE COMPLETE SET.
         *
         * This creates the seamless loop:
         *
         * P1 P2 P3 | P1 P2 P3
         *
         * When first set exits,
         * second set is already entering.
         */

        container.innerHTML =
            productHTML +
            productHTML;


        /*
         * RESET
         */

        container.style.animation =
            "none";

        container.style.transform =
            "translate3d(0,0,0)";


        /*
         * WAIT FOR LAYOUT
         */

        requestAnimationFrame(
            () => {

                requestAnimationFrame(
                    () => {

                        startZMEditAnimation();

                        syncWishlistButtons();

                    }
                );

            }
        );

    }
    catch (error) {

        console.error(
            "ZM Edit Products Error:",
            error
        );


        stopZMEditAnimation();


        container.innerHTML =
            "";

    }

}


/* =========================================================
   NEWSLETTER
========================================================= */

function setupNewsletter() {

    const newsletterForm =
        document.querySelector(
            ".newsletter-form"
        );


    if (!newsletterForm) {

        return;

    }


    newsletterForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const input =
                newsletterForm.querySelector(
                    "input[type='email'], input"
                );


            if (!input) {

                return;

            }


            const email =
                input.value.trim();


            if (!email) {

                alert(
                    "Please enter your email."
                );


                input.focus();

                return;

            }


            alert(
                "Thank you for subscribing to ZM LABEL!"
            );


            newsletterForm.reset();

        }
    );

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
        getWishlistToken();


    if (!token) {

        badge.innerText =
            "0";

        return;

    }


    try {

        const response =
            await fetch(
                `${API}/wishlist`,
                {
                    method: "GET",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }
            );


        if (!response.ok) {

            badge.innerText =
                "0";

            return;

        }


        const data =
            await response.json();


        if (
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


        badge.innerText =
            "0";

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message
) {

    const old =
        document.getElementById(
            "zmWishlistNotification"
        );


    if (old) {

        old.remove();

    }


    const notification =
        document.createElement(
            "div"
        );


    notification.id =
        "zmWishlistNotification";


    notification.innerHTML = `
        <span style="
            color:#e00000;
            font-size:18px;
            line-height:1;
        ">♥</span>

        <span>
            ${String(message)
                .replace("❤️", "")
                .replace("💔", "")
                .trim()}
        </span>
    `;


    notification.style.position =
        "fixed";

    notification.style.top =
        "35px";

    notification.style.right =
        "25px";

    notification.style.left =
        "auto";

    notification.style.bottom =
        "auto";

    notification.style.zIndex =
        "2147483647";

    notification.style.display =
        "flex";

    notification.style.alignItems =
        "center";

    notification.style.gap =
        "9px";

    notification.style.padding =
        "11px 16px";

    notification.style.background =
        "#111";

    notification.style.color =
        "#fff";

    notification.style.borderRadius =
        "6px";

    notification.style.fontFamily =
        "Montserrat, sans-serif";

    notification.style.fontSize =
        "12px";

    notification.style.fontWeight =
        "600";

    notification.style.whiteSpace =
        "nowrap";

    notification.style.boxShadow =
        "0 8px 30px rgba(0,0,0,.25)";

    notification.style.opacity =
        "0";

    notification.style.transform =
        "translateY(-12px)";

    notification.style.pointerEvents =
        "none";

    notification.style.transition =
        "opacity .25s ease, transform .25s ease";


    document.body.appendChild(
        notification
    );


    requestAnimationFrame(
        () => {

            notification.style.opacity =
                "1";

            notification.style.transform =
                "translateY(0)";

        }
    );


    clearTimeout(
        window.zmWishlistNotificationTimer
    );


    window.zmWishlistNotificationTimer =
        setTimeout(
            () => {

                notification.style.opacity =
                    "0";

                notification.style.transform =
                    "translateY(-12px)";


                setTimeout(
                    () => {

                        if (notification) {

                            notification.remove();

                        }

                    },
                    300
                );

            },
            2200
        );

}


/* =========================================================
   NEW ARRIVALS CAROUSEL
========================================================= */

function setupNewArrivalsCarousel() {

    const wrapper =
        document.querySelector(
            ".arrivals-track-wrapper"
        );


    const track =
        document.getElementById(
            "productsContainer"
        );


    const prevBtn =
        document.getElementById(
            "arrivalsPrev"
        );


    const nextBtn =
        document.getElementById(
            "arrivalsNext"
        );


    const progress =
        document.getElementById(
            "arrivalsProgress"
        );


    if (
        !wrapper ||
        !track
    ) {

        return;

    }


    let currentIndex =
        0;


    function getCardWidth() {

        const card =
            track.querySelector(
                ".product-card"
            );


        if (!card) {

            return 0;

        }


        const styles =
            window.getComputedStyle(
                track
            );


        const gap =
            parseFloat(
                styles.columnGap ||
                styles.gap ||
                "0"
            );


        return (
            card.offsetWidth +
            gap
        );

    }


    function updateProgress() {

        if (!progress) {

            return;

        }


        const cards =
            track.querySelectorAll(
                ".product-card"
            );


        if (!cards.length) {

            progress.style.width =
                "0%";

            return;

        }


        if (
            window.innerWidth <=
            768
        ) {

            const scrollable =
                wrapper.scrollWidth -
                wrapper.clientWidth;


            if (
                scrollable <=
                0
            ) {

                progress.style.width =
                    "100%";

                return;

            }


            const percentage =
                (
                    wrapper.scrollLeft /
                    scrollable
                ) *
                    75 +
                25;


            progress.style.width =
                `${Math.min(
                    100,
                    percentage
                )}%`;


            return;

        }


        const cardWidth =
            getCardWidth();


        const maxTranslate =
            Math.max(
                0,
                track.scrollWidth -
                wrapper.clientWidth
            );


        if (
            !maxTranslate
        ) {

            progress.style.width =
                "100%";

            return;

        }


        const currentTranslate =
            Math.min(
                currentIndex *
                cardWidth,
                maxTranslate
            );


        const percentage =
            (
                currentTranslate /
                maxTranslate
            ) *
                75 +
            25;


        progress.style.width =
            `${Math.min(
                100,
                percentage
            )}%`;

    }


    function updateCarousel() {

        const cards =
            track.querySelectorAll(
                ".product-card"
            );


        if (!cards.length) {

            return;

        }


        if (
            window.innerWidth <=
            768
        ) {

            track.style.transform =
                "none";


            if (prevBtn) {

                prevBtn.disabled =
                    true;

            }


            if (nextBtn) {

                nextBtn.disabled =
                    true;

            }


            updateProgress();

            return;

        }


        const cardWidth =
            getCardWidth();


        if (!cardWidth) {

            return;

        }


        const maxTranslate =
            Math.max(
                0,
                track.scrollWidth -
                wrapper.clientWidth
            );


        let translate =
            currentIndex *
            cardWidth;


        translate =
            Math.min(
                translate,
                maxTranslate
            );


        track.style.transform =
            `translateX(-${translate}px)`;


        const maxIndex =
            Math.max(
                0,
                Math.ceil(
                    maxTranslate /
                    cardWidth
                )
            );


        if (prevBtn) {

            prevBtn.disabled =
                currentIndex <=
                0;

        }


        if (nextBtn) {

            nextBtn.disabled =
                currentIndex >=
                maxIndex;

        }


        updateProgress();

    }


    if (nextBtn) {

        nextBtn.addEventListener(
            "click",
            () => {

                const cardWidth =
                    getCardWidth();


                if (!cardWidth) {

                    return;

                }


                const maxTranslate =
                    Math.max(
                        0,
                        track.scrollWidth -
                        wrapper.clientWidth
                    );


                const maxIndex =
                    Math.max(
                        0,
                        Math.ceil(
                            maxTranslate /
                            cardWidth
                        )
                    );


                if (
                    currentIndex <
                    maxIndex
                ) {

                    currentIndex++;

                    updateCarousel();

                }

            }
        );

    }


    if (prevBtn) {

        prevBtn.addEventListener(
            "click",
            () => {

                if (
                    currentIndex >
                    0
                ) {

                    currentIndex--;

                    updateCarousel();

                }

            }
        );

    }


    wrapper.addEventListener(
        "scroll",
        () => {

            if (
                window.innerWidth <=
                768
            ) {

                updateProgress();

            }

        },
        {
            passive: true
        }
    );


    let resizeTimer;


    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    () => {

                        currentIndex =
                            0;


                        updateCarousel();


                        /*
                         * Restart ZM Edit
                         */

                        if (
                            document.getElementById(
                                "floatingProducts"
                            )
                        ) {

                            startZMEditAnimation();

                        }

                    },
                    150
                );

        }
    );


    const observer =
        new MutationObserver(
            () => {

                currentIndex =
                    0;


                setTimeout(
                    updateCarousel,
                    100
                );

            }
        );


    observer.observe(
        track,
        {
            childList: true
        }
    );


    setTimeout(
        updateCarousel,
        300
    );

}


/* =========================================================
   GLOBAL INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadProducts();

        loadZMEditProducts();

        loadWishlistCount();

        setupNewsletter();

        setupNewArrivalsCarousel();


        setTimeout(
            syncWishlistButtons,
            500
        );


        if (
            typeof updateCartCount ===
            "function"
        ) {

            updateCartCount();

        }

    }
);