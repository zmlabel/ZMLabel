/* =========================================================
   ZM LABEL — ADMIN STUDIO
   COMPLETE ADMIN.JS
   CLEAN / SAFE / PROFESSIONAL
   ========================================================= */

(function () {

    "use strict";

    console.log("✓ ZM LABEL Admin Studio loading...");


    /* =========================================================
   ADMIN — PREVENT BACK/FORWARD CACHE
========================================================= */

window.addEventListener(
    "pageshow",
    function (event) {

        if (event.persisted) {

            window.location.reload();

        }

    }
);


    /* =========================================================
       CONFIG
       ========================================================= */

    const CONFIG = {

        API_BASE:
            window.API_BASE_URL ||
            window.API_URL ||
            "http://localhost:5000",

        API_PREFIX: "/api",

        LOW_STOCK_LIMIT: 5,

        REQUEST_TIMEOUT: 30000

    };


    const API_BASE =
        CONFIG.API_BASE.replace(/\/+$/, "");


    const API_PREFIX =
        CONFIG.API_PREFIX.replace(/^\/+|\/+$/g, "");


    /* =========================================================
       GLOBAL STATE
       ========================================================= */

    const state = {

        products: [],

        orders: [],

        customers: [],

        homepageProducts: [],

        featuredProducts: [],

        notifications: [],

        currentPage: "dashboard",

        currentOrder: null,

        selectedImages: [],

        charts: {},

        loading: false

    };


    /* =========================================================
       DOM HELPER
       ========================================================= */

    function $(id) {

        return document.getElementById(id);

    }


    function qs(selector, parent = document) {

        return parent.querySelector(selector);

    }


    function qsa(selector, parent = document) {

        return Array.from(
            parent.querySelectorAll(selector)
        );

    }


    /* =========================================================
       API URL
       ========================================================= */

    function buildApiUrl(endpoint) {

        if (!endpoint) {

            return API_BASE;

        }


        endpoint =
            String(endpoint).trim();


        /*
         * Already absolute URL
         */

        if (
            endpoint.startsWith("http://") ||
            endpoint.startsWith("https://")
        ) {

            return endpoint;

        }


        /*
         * Remove accidental absolute API prefix
         */

        endpoint =
            endpoint
                .replace(/^https?:\/\/[^/]+/i, "")
                .replace(/^\/+/, "");


        /*
         * If endpoint already begins with api/
         */

        if (
            endpoint === API_PREFIX ||
            endpoint.startsWith(API_PREFIX + "/")
        ) {

            return `${API_BASE}/${endpoint}`;

        }


        return `${API_BASE}/${API_PREFIX}/${endpoint}`;

    }


    /* =========================================================
       API REQUEST
       ========================================================= */

    async function apiRequest(
        endpoint,
        options = {}
    ) {

        const url =
            buildApiUrl(endpoint);


        console.log(
            "ZM API REQUEST:",
            url
        );


        const controller =
            new AbortController();


        const timeout =
            setTimeout(
                () => controller.abort(),
                CONFIG.REQUEST_TIMEOUT
            );


        try {

            const headers = {
                ...(options.headers || {})
            };


            /*
             * Do NOT manually set
             * Content-Type for FormData.
             */

            if (
                options.body &&
                !(options.body instanceof FormData)
            ) {

                headers["Content-Type"] =
                    "application/json";

            }


            /*
             * Auth token
             */

            const token =
                localStorage.getItem("token") ||
                localStorage.getItem("adminToken") ||
                localStorage.getItem("authToken");


            if (token) {

                headers.Authorization =
                    `Bearer ${token}`;

            }


            const response =
                await fetch(
                    url,
                    {
                        ...options,
                        headers,
                        signal:
                            controller.signal
                    }
                );


            let data = null;

            const contentType =
                response.headers.get(
                    "content-type"
                );


            if (
                contentType &&
                contentType.includes(
                    "application/json"
                )
            ) {

                data =
                    await response.json();

            }
            else {

                const text =
                    await response.text();

                data =
                    text
                        ? {
                            success:
                                response.ok,
                            message:
                                text
                        }
                        : {
                            success:
                                response.ok
                        };

            }


            if (!response.ok) {

                console.error(
                    "ZM API ERROR:",
                    response.status,
                    url,
                    data
                );


                throw new Error(
                    data?.message ||
                    data?.error ||
                    `Server error ${response.status}`
                );

            }


            return data;

        }
        catch (error) {

            if (
                error.name ===
                "AbortError"
            ) {

                throw new Error(
                    "Request timed out."
                );

            }


            console.error(
                "API Request Failed:",
                url,
                error
            );


            throw error;

        }
        finally {

            clearTimeout(timeout);

        }

    }


    async function apiGet(endpoint) {

        return apiRequest(
            endpoint,
            {
                method: "GET"
            }
        );

    }


    async function apiPost(
        endpoint,
        body
    ) {

        return apiRequest(
            endpoint,
            {
                method: "POST",
                body:
                    body instanceof FormData
                        ? body
                        : JSON.stringify(body)
            }
        );

    }


    async function apiPut(
        endpoint,
        body
    ) {

        return apiRequest(
            endpoint,
            {
                method: "PUT",
                body:
                    body instanceof FormData
                        ? body
                        : JSON.stringify(body)
            }
        );

    }


    async function apiDelete(endpoint) {

        return apiRequest(
            endpoint,
            {
                method: "DELETE"
            }
        );

    }


    /* =========================================================
       IMAGE URL
       ========================================================= */

    function getImageUrl(image) {

        if (!image) {

            return "";

        }


        let value = image;


        /*
         * Object image
         */

        if (
            typeof value === "object"
        ) {

            value =
                value.url ||
                value.path ||
                value.filename ||
                value.file ||
                "";

        }


        value =
            String(value).trim();


        if (!value) {

            return "";

        }


        /*
         * Already absolute
         */

        if (
            value.startsWith("http://") ||
            value.startsWith("https://") ||
            value.startsWith("blob:")
        ) {

            return value;

        }


        /*
         * Remove localhost frontend
         * accidentally saved in DB
         */

        value =
            value.replace(
                /^https?:\/\/127\.0\.0\.1:5500/i,
                ""
            );


        value =
            value.replace(
                /^https?:\/\/localhost:\d+/i,
                ""
            );


        value =
            value.replace(
                /^\.?\//,
                ""
            );


        value =
            value.replace(
                /^\/+/,
                ""
            );


        /*
         * Backend uploads folder
         */

        if (
            value.startsWith("uploads/")
        ) {

            return `${API_BASE}/${value}`;

        }


        /*
         * If path contains uploads
         */

        if (
            value.includes("/uploads/")
        ) {

            const index =
                value.indexOf(
                    "uploads/"
                );


            return `${API_BASE}/${value.slice(index)}`;

        }


        /*
         * Normal filename
         */

        return `${API_BASE}/uploads/${value}`;

    }


    /* =========================================================
       SAFE TEXT
       ========================================================= */

    function escapeHtml(value) {

        return String(
            value ?? ""
        )
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =========================================================
       MONEY
       ========================================================= */

    function formatMoney(value) {

        const number =
            Number(value) || 0;


        return (
            "Rs. " +
            number.toLocaleString(
                "en-PK"
            )
        );

    }


    /* =========================================================
       DATE
       ========================================================= */

    function formatDate(value) {

        if (!value) {

            return "-";

        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "-";

        }


        return date.toLocaleDateString(
            "en-PK",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    function formatDateTime(value) {

        if (!value) {

            return "-";

        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "-";

        }


        return date.toLocaleString(
            "en-PK",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    /* =========================================================
       EXTRACT ARRAY FROM API
       ========================================================= */

    function extractArray(data) {

        if (
            Array.isArray(data)
        ) {

            return data;

        }


        if (
            Array.isArray(
                data?.products
            )
        ) {

            return data.products;

        }


        if (
            Array.isArray(
                data?.orders
            )
        ) {

            return data.orders;

        }


        if (
            Array.isArray(
                data?.users
            )
        ) {

            return data.users;

        }


        if (
            Array.isArray(
                data?.customers
            )
        ) {

            return data.customers;

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


    /* =========================================================
       TOAST
       ========================================================= */

    function showToast(
        message,
        type = "success"
    ) {

        const toast =
            $("toast");


        const toastMessage =
            $("toastMessage");


        if (!toast) {

            return;

        }


        if (toastMessage) {

            toastMessage.textContent =
                message;

        }


        const icon =
            qs("i", toast);


        if (icon) {

            icon.className =
                type === "error"
                    ? "ri-error-warning-line"
                    : type === "warning"
                        ? "ri-alert-line"
                        : "ri-check-line";

        }


        toast.classList.add(
            "show"
        );


        clearTimeout(
            toast._timer
        );


        toast._timer =
            setTimeout(
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                3000
            );

    }


    /* =========================================================
       LOADING BUTTON
       ========================================================= */

    function setButtonLoading(
        button,
        loading,
        loadingText = "Saving..."
    ) {

        if (!button) {

            return;

        }


        if (loading) {

            button.dataset.originalText =
                button.innerHTML;


            button.disabled = true;


            button.innerHTML =
                `
                <i class="ri-loader-4-line ri-spin"></i>
                ${loadingText}
                `;

        }
        else {

            button.disabled = false;


            if (
                button.dataset.originalText
            ) {

                button.innerHTML =
                    button.dataset.originalText;

            }

        }

    }


    /* =========================================================
       NAVIGATION
       ========================================================= */

    const pageNames = {

        dashboard:
            "Dashboard",

        products:
            "Products",

        "add-product":
            "Add Product",

        orders:
            "Orders",

        customers:
            "Customers",

        analytics:
            "Analytics",

        homepage:
            "Homepage",

        settings:
            "Settings"

    };


    async function navigateTo(
        page
    ) {

        if (!page) {

            return;

        }


        state.currentPage =
            page;


        qsa(
            ".page-section"
        ).forEach(
            section => {

                section.classList.remove(
                    "active"
                );

            }
        );


        const section =
            $(
                page === "add-product"
                    ? "addProductSection"
                    : `${page}Section`
            );


        if (section) {

            section.classList.add(
                "active"
            );

        }


        qsa(
            ".nav-item"
        ).forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.page === page
                );

            }
        );


        const breadcrumb =
            $("breadcrumbCurrent");


        if (breadcrumb) {

            breadcrumb.textContent =
                pageNames[page] ||
                page;

        }


        /*
         * Close mobile sidebar
         */

        closeSidebar();


        /*
         * Page specific loaders
         */

        try {

            if (
                page === "dashboard"
            ) {

                await loadDashboard();

            }


            else if (
                page === "products"
            ) {

                await loadProducts();

            }


            else if (
                page === "orders"
            ) {

                await loadOrders();

            }


            else if (
                page === "customers"
            ) {

                await loadCustomers();

            }


            else if (
                page === "analytics"
            ) {

                await loadAnalytics();

            }


            else if (
                page === "homepage"
            ) {

                await loadHomepageProducts();

            }

        }
        catch (error) {

            console.error(
                `Page load error [${page}]`,
                error
            );

            showToast(
                error.message ||
                "Unable to load page.",
                "error"
            );

        }

    }


    function showSection(page) {

        navigateTo(page);

    }


    /* =========================================================
       SIDEBAR
       ========================================================= */

    function openSidebar() {

        const sidebar =
            $("sidebar");

        const overlay =
            $("sidebarOverlay");


        sidebar?.classList.add(
            "open"
        );

        overlay?.classList.add(
            "show"
        );

    }


    function closeSidebar() {

        const sidebar =
            $("sidebar");

        const overlay =
            $("sidebarOverlay");


        sidebar?.classList.remove(
            "open"
        );

        overlay?.classList.remove(
            "show"
        );

    }


    function toggleSidebar() {

        const sidebar =
            $("sidebar");


        if (
            sidebar?.classList.contains(
                "open"
            )
        ) {

            closeSidebar();

        }
        else {

            openSidebar();

        }

    }


    /* =========================================================
       PROFILE
       ========================================================= */

    function closeFloatingPanels() {

        $("profileDropdown")
            ?.classList.remove(
                "show"
            );


        $("notificationPanel")
            ?.classList.remove(
                "show"
            );


        $("sidebarUserMenu")
            ?.classList.remove(
                "show"
            );

    }


    /* =========================================================
       CHART SAFE DESTROY
       ========================================================= */

    function destroyChart(
        canvasId
    ) {

        const canvas =
            $(canvasId);


        /*
         * Stored instance
         */

        if (
            state.charts[canvasId]
        ) {

            try {

                state.charts[
                    canvasId
                ].destroy();

            }
            catch (error) {

                console.warn(
                    "Chart destroy:",
                    error
                );

            }


            state.charts[
                canvasId
            ] = null;

        }


        /*
         * Chart.js native instance
         */

        if (
            canvas &&
            typeof Chart !==
            "undefined" &&
            typeof Chart.getChart ===
            "function"
        ) {

            const existing =
                Chart.getChart(
                    canvas
                );


            if (existing) {

                try {

                    existing.destroy();

                }
                catch (error) {

                    console.warn(
                        "Native chart destroy:",
                        error
                    );

                }

            }

        }

    }


    function createChart(
        canvasId,
        config
    ) {

        if (
            typeof Chart ===
            "undefined"
        ) {

            console.warn(
                "Chart.js not loaded."
            );

            return null;

        }


        const canvas =
            $(canvasId);


        if (!canvas) {

            return null;

        }


        destroyChart(
            canvasId
        );


        try {

            const chart =
                new Chart(
                    canvas.getContext("2d"),
                    config
                );


            state.charts[
                canvasId
            ] = chart;


            return chart;

        }
        catch (error) {

            console.error(
                "Chart creation error:",
                canvasId,
                error
            );


            return null;

        }

    }


    /* =========================================================
       DASHBOARD
       ========================================================= */

    async function loadDashboard() {

        try {

            await Promise.all([
                loadProducts(),
                loadOrders(),
                loadCustomers()
            ]);


            updateDashboardStats();

            renderRecentOrders();

            renderLowStock();

            renderOrderStatus();

            renderDashboardCharts();

        }
        catch (error) {

            console.error(
                "Dashboard error:",
                error
            );

        }

    }


    function updateDashboardStats() {

        const products =
            state.products.length;


        const orders =
            state.orders.length;


        const customers =
            state.customers.length;


        const revenue =
            state.orders.reduce(
                (
                    total,
                    order
                ) => {

                    const status =
                        normalizeStatus(
                            order.status
                        );


                    if (
                        status ===
                        "cancelled"
                    ) {

                        return total;

                    }


                    return total +
                        getOrderTotal(
                            order
                        );

                },
                0
            );


        setText(
            "productsCount",
            products
        );


        setText(
            "ordersCount",
            orders
        );


        setText(
            "customersCount",
            customers
        );


        setText(
            "revenueCount",
            formatMoney(
                revenue
            )
        );


        updateSidebarOrderCount();

    }


    function setText(
        id,
        value
    ) {

        const element =
            $(id);


        if (element) {

            element.textContent =
                value;

        }

    }


    function updateSidebarOrderCount() {

        const count =
            state.orders.filter(
                order => {

                    const status =
                        normalizeStatus(
                            order.status
                        );


                    return (
                        status !==
                        "delivered" &&
                        status !==
                        "cancelled"
                    );

                }
            ).length;


        setText(
            "sidebarOrderCount",
            count
        );

    }


    /* =========================================================
       PRODUCTS
       ========================================================= */

    async function loadProducts() {

        try {

            const response =
                await apiGet(
                    "/products"
                );


            state.products =
                extractArray(
                    response
                );


            renderProducts();

            updateDashboardStats();

            return state.products;

        }
        catch (error) {

            console.error(
                "Products load error:",
                error
            );


            const tbody =
                $("productsList");


            if (tbody) {

                tbody.innerHTML =
                    `
                    <tr>
                        <td colspan="7">
                            <div class="empty-state">
                                <i class="ri-error-warning-line"></i>
                                <strong>Unable to load products</strong>
                                <span>${escapeHtml(error.message)}</span>
                            </div>
                        </td>
                    </tr>
                    `;

            }


            return [];

        }

    }


    function getProductImage(
        product
    ) {

        if (!product) {

            return "";

        }


        const images =
            product.images ||
            product.imageUrls ||
            product.photos;


        if (
            Array.isArray(images) &&
            images.length
        ) {

            return getImageUrl(
                images[0]
            );

        }


        return getImageUrl(
            product.image ||
            product.imageUrl ||
            product.thumbnail
        );

    }


    function getProductPrice(
        product
    ) {

        return Number(
            product?.price ??
            product?.sellingPrice ??
            0
        );

    }


    function getProductStock(
        product
    ) {

        return Number(
            product?.stock ??
            product?.quantity ??
            0
        );

    }


    function renderProducts(
        products = state.products
    ) {

        const tbody =
            $("productsList");


        if (!tbody) {

            return;

        }


        if (!products.length) {

            tbody.innerHTML =
                `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <i class="ri-shopping-bag-3-line"></i>
                            <strong>No products found</strong>
                            <span>Add your first product to get started.</span>
                        </div>
                    </td>
                </tr>
                `;

            return;

        }


        tbody.innerHTML =
            products.map(
                product => {

                    const id =
                        product._id ||
                        product.id;


                    const image =
                        getProductImage(
                            product
                        );


                    const stock =
                        getProductStock(
                            product
                        );


                    const status =
                        product.status ||
                        (
                            product.isActive ===
                            false
                                ? "Draft"
                                : "Active"
                        );


                    return `
                    <tr>

                        <td>

                            <div class="product-table-item">

                                ${
                                    image
                                        ? `
                                        <img
                                            src="${escapeHtml(image)}"
                                            alt="${escapeHtml(product.name || "Product")}"
                                            onerror="this.style.display='none'"
                                        >
                                        `
                                        : `
                                        <div class="product-placeholder">
                                            <i class="ri-image-line"></i>
                                        </div>
                                        `
                                }

                                <div>

                                    <strong>
                                        ${escapeHtml(
                                            product.name ||
                                            "Unnamed Product"
                                        )}
                                    </strong>

                                    <span>
                                        #${escapeHtml(
                                            String(id || "").slice(-8)
                                        )}
                                    </span>

                                </div>

                            </div>

                        </td>


                        <td>
                            ${escapeHtml(
                                product.brand ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                product.category ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${formatMoney(
                                getProductPrice(
                                    product
                                )
                            )}
                        </td>


                        <td>

                            <span class="
                                stock-pill
                                ${
                                    stock <= 0
                                        ? "out"
                                        : stock <=
                                          CONFIG.LOW_STOCK_LIMIT
                                            ? "low"
                                            : "good"
                                }
                            ">
                                ${stock}
                            </span>

                        </td>


                        <td>

                            <span class="
                                status-badge
                                ${
                                    String(
                                        status
                                    ).toLowerCase() ===
                                    "active"
                                        ? "success"
                                        : "warning"
                                }
                            ">
                                ${escapeHtml(
                                    status
                                )}
                            </span>

                        </td>


                        <td>

                            <div class="table-actions">

                                <button
                                    type="button"
                                    class="table-action"
                                    title="Delete"
                                    data-delete-product="${escapeHtml(
                                        id
                                    )}"
                                >
                                    <i class="ri-delete-bin-line"></i>
                                </button>

                            </div>

                        </td>

                    </tr>
                    `;

                }
            ).join("");

    }


   /* =========================================================
   ADD PRODUCT — SUB CATEGORIES
   ========================================================= */

const subCategories = {

    "Hoodies & Shirts": [
        "Hoodies",
        "Oversized Hoodies",
        "Zip Hoodies",
        "Casual Shirts",
        "Formal Shirts",
        "Overshirts"
    ],

    "Oversized Tees": [
        "Oversized Tees",
        "Graphic Tees"
    ],

    "Homepage": [
        "Latest Collection",
        "ZM Edit"
    ],

    "Bottom": [
        "Baggy Trousers",
        "Cargo Pants",
        "Jeans",
        "Track Pants"
    ],

    "Footwear": [
        "Sneakers",
        "Casual Shoes",
        "Slides"
    ],

    "SALE": [
        "Hoodies",
        "Oversized Tees",
        "Bottom",
        "Footwear"
    ]

};


function updateSubCategories() {

    const category =
        $("productCategory")?.value;

    const select =
        $("productSubCategory");

    const help =
        $("subCategoryHelp");


    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Select Sub Category
        </option>
    `;


    const list =
        subCategories[category] || [];


    list.forEach(value => {

        const option =
            document.createElement("option");

        option.value =
            value;

        option.textContent =
            value;

        select.appendChild(option);

    });


    if (help) {

        help.textContent =
            list.length
                ? `${list.length} sub-categories available.`
                : "Select a category to load its sub-categories.";

    }

}


    /* =========================================================
       IMAGE PREVIEW
       ========================================================= */

    function renderImagePreview() {

        const container =
            $("imagePreview");


        if (!container) {

            return;

        }


        container.innerHTML = "";


        state.selectedImages.forEach(
            (
                item,
                index
            ) => {

                const wrapper =
                    document.createElement(
                        "div"
                    );


                wrapper.className =
                    "preview-item";


                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    item.url;


                image.alt =
                    item.file?.name ||
                    `Product image ${index + 1}`;


                const remove =
                    document.createElement(
                        "button"
                    );


                remove.type =
                    "button";


                remove.className =
                    "preview-remove";


                remove.innerHTML =
                    '<i class="ri-close-line"></i>';


                remove.setAttribute(
                    "aria-label",
                    "Remove image"
                );


                remove.addEventListener(
                    "click",
                    () => {

                        removeSelectedImage(
                            index
                        );

                    }
                );


                const badge =
                    document.createElement(
                        "span"
                    );


                badge.className =
                    "preview-index";


                badge.textContent =
                    index + 1;


                wrapper.appendChild(
                    image
                );


                wrapper.appendChild(
                    badge
                );


                wrapper.appendChild(
                    remove
                );


                container.appendChild(
                    wrapper
                );

            }
        );

    }


    function removeSelectedImage(
        index
    ) {

        const item =
            state.selectedImages[
                index
            ];


        if (
            item?.url &&
            item.url.startsWith(
                "blob:"
            )
        ) {

            URL.revokeObjectURL(
                item.url
            );

        }


        state.selectedImages.splice(
            index,
            1
        );


        renderImagePreview();


        syncImageInput();

    }


    function syncImageInput() {

        const input =
            $("productImage");


        if (!input) {

            return;

        }


        /*
         * FileList cannot be directly
         * assigned. DataTransfer creates
         * a new FileList.
         */

        try {

            const dataTransfer =
                new DataTransfer();


            state.selectedImages
                .forEach(
                    item => {

                        if (item.file) {

                            dataTransfer.items.add(
                                item.file
                            );

                        }

                    }
                );


            input.files =
                dataTransfer.files;

        }
        catch (error) {

            console.warn(
                "Could not sync files:",
                error
            );

        }

    }


    function handleImageSelection(
        event
    ) {

        const files =
            Array.from(
                event.target.files ||
                []
            );


        if (!files.length) {

            return;

        }


        const imageFiles =
            files.filter(
                file =>
                    file.type.startsWith(
                        "image/"
                    )
            );


        imageFiles.forEach(
            file => {

                /*
                 * Prevent exact duplicate
                 */

                const duplicate =
                    state.selectedImages.some(
                        item =>
                            item.file &&
                            item.file.name ===
                                file.name &&
                            item.file.size ===
                                file.size &&
                            item.file.lastModified ===
                                file.lastModified
                    );


                if (duplicate) {

                    return;

                }


                state.selectedImages.push(
                    {
                        file,
                        url:
                            URL.createObjectURL(
                                file
                            )
                    }
                );

            }
        );


        renderImagePreview();

        syncImageInput();

    }


    /* =========================================================
       RESET PRODUCT FORM
       ========================================================= */

    function resetProductForm() {

        const form =
            $("productForm");


        if (form) {

            form.reset();

        }


        state.selectedImages.forEach(
            item => {

                if (
                    item.url?.startsWith(
                        "blob:"
                    )
                ) {

                    URL.revokeObjectURL(
                        item.url
                    );

                }

            }
        );


        state.selectedImages = [];


        renderImagePreview();

        updateSubCategories();

    }


    /* =========================================================
       CREATE PRODUCT
       ========================================================= */

    async function handleProductSubmit(
        event
    ) {

        event.preventDefault();


        const form =
            $("productForm");


        const button =
            $("saveProductBtn");


        if (!form) {

            return;

        }


        const name =
            $("productName")?.value.trim();


        const category =
            $("productCategory")?.value;


        const subCategory =
            $("productSubCategory")?.value;


        const description =
            $("productDescription")?.value.trim();


        const price =
            $("productPrice")?.value;


        const stock =
            $("productStock")?.value;


        if (!name) {

            showToast(
                "Product name is required.",
                "error"
            );

            return;

        }


        if (!category) {

            showToast(
                "Please select a category.",
                "error"
            );

            return;

        }


        if (!subCategory) {

            showToast(
                "Please select a sub category.",
                "error"
            );

            return;

        }


        if (!description) {

            showToast(
                "Product description is required.",
                "error"
            );

            return;

        }


        if (
            price === "" ||
            Number(price) < 0
        ) {

            showToast(
                "Enter a valid price.",
                "error"
            );

            return;

        }


        if (
            stock === "" ||
            Number(stock) < 0
        ) {

            showToast(
                "Enter a valid stock quantity.",
                "error"
            );

            return;

        }


        if (
            state.selectedImages.length === 0
        ) {

            showToast(
                "Please select at least one product image.",
                "error"
            );

            return;

        }


        setButtonLoading(
            button,
            true,
            "Saving Product..."
        );


        try {

            const formData =
                new FormData();


            /*
             * Basic fields
             */

            formData.append(
                "name",
                name
            );


            formData.append(
                "brand",
                $("productBrand")?.value.trim() ||
                ""
            );


            formData.append(
                "category",
                category
            );


            formData.append(
                "subCategory",
                subCategory
            );


            formData.append(
                "description",
                description
            );


            formData.append(
                "price",
                Number(price)
            );


            formData.append(
                "discount",
                Number(
                    $("productDiscount")?.value ||
                    0
                )
            );


            formData.append(
                "stock",
                Number(stock)
            );


            formData.append(
                "badge",
                $("productBadge")?.value.trim() ||
                ""
            );


            formData.append(
                "status",
                $("productStatus")?.value ||
                "Active"
            );


            formData.append(
                "featured",
                $("productFeatured")?.checked
                    ? "true"
                    : "false"
            );


            formData.append(
                "showOnHome",
                $("productShowOnHome")?.checked
                    ? "true"
                    : "false"
            );


            /*
             * Colors
             */

            const colors =
                $("productColors")?.value
                    .split(",")
                    .map(
                        value =>
                            value.trim()
                    )
                    .filter(Boolean);


            colors.forEach(
                color => {

                    formData.append(
                        "colors",
                        color
                    );

                }
            );


            /*
             * Sizes
             */

            const sizes =
                $("productSizes")?.value
                    .split(",")
                    .map(
                        value =>
                            value.trim()
                    )
                    .filter(Boolean);


            sizes.forEach(
                size => {

                    formData.append(
                        "sizes",
                        size
                    );

                }
            );


            /*
             * IMPORTANT:
             *
             * Send ALL images using
             * the same "images" field.
             *
             * This works with:
             *
             * upload.array("images")
             *
             */

            state.selectedImages.forEach(
                item => {

                    if (item.file) {

                        formData.append(
                            "images",
                            item.file
                        );

                    }

                }
            );


            const response =
            await apiPost(
    "/products/add",
    formData
);


            console.log(
    "PRODUCT CREATED:",
    response
);

console.log(
    "CREATED PRODUCT ID:",
    response?._id ||
    response?.product?._id ||
    response?.data?._id
);


            showToast(
                response?.message ||
                "Product added successfully."
            );


            resetProductForm();


            await loadProducts();


            /*
             * Go to products page
             */

            setTimeout(
                () => {

                    navigateTo(
                        "products"
                    );

                },
                500
            );

        }
        catch (error) {

            console.error(
                "Add product error:",
                error
            );


            showToast(
                error.message ||
                "Product could not be added.",
                "error"
            );

        }
        finally {

            setButtonLoading(
                button,
                false
            );

        }

    }


    /* =========================================================
       DELETE PRODUCT
       ========================================================= */

    async function deleteProduct(
        productId
    ) {

        if (!productId) {

            return;

        }


        const confirmed =
            window.confirm(
                "Are you sure you want to delete this product?"
            );


        if (!confirmed) {

            return;

        }


        try {

           await apiDelete(
    `/products/delete/${encodeURIComponent(
        productId
    )}`
);


            showToast(
                "Product deleted successfully."
            );


            await loadProducts();

        }
        catch (error) {

            console.error(
                "Delete product error:",
                error
            );


            showToast(
                error.message ||
                "Unable to delete product.",
                "error"
            );

        }

    }


    /* =========================================================
       ORDERS
       ========================================================= */

    async function loadOrders() {

        try {

            const response =
                await apiGet(
                    "/orders"
                );


            state.orders =
                extractArray(
                    response
                );


            renderOrders();

            updateOrderSummary();

            renderRecentOrders();

            renderOrderStatus();

            updateDashboardStats();

            updateNotifications();

            return state.orders;

        }
        catch (error) {

            console.error(
                "Orders error:",
                error
            );


            const tbody =
                $("ordersTableBody");


            if (tbody) {

                tbody.innerHTML =
                    `
                    <tr>
                        <td colspan="9">
                            <div class="empty-state">
                                <i class="ri-error-warning-line"></i>
                                <strong>Unable to load orders</strong>
                                <span>${escapeHtml(error.message)}</span>
                            </div>
                        </td>
                    </tr>
                    `;

            }


            return [];

        }

    }


    function normalizeStatus(
        status
    ) {

        const value =
            String(
                status ||
                "Pending"
            )
                .trim()
                .toLowerCase();


        if (
            value ===
            "processing"
        ) {

            return "processing";

        }


        if (
            value ===
            "confirmed"
        ) {

            return "confirmed";

        }


        if (
            value ===
            "shipped"
        ) {

            return "shipped";

        }


        if (
            value ===
            "delivered"
        ) {

            return "delivered";

        }


        if (
            value ===
            "cancelled" ||
            value ===
            "canceled"
        ) {

            return "cancelled";

        }


        return "pending";

    }


    function displayStatus(
        status
    ) {

        const normalized =
            normalizeStatus(
                status
            );


        const labels = {

            processing:
                "Processing",

            pending:
                "Pending",

            confirmed:
                "Confirmed",

            shipped:
                "Shipped",

            delivered:
                "Delivered",

            cancelled:
                "Cancelled"

        };


        return labels[
            normalized
        ] || "Pending";

    }


    function getOrderTotal(
        order
    ) {

        return Number(
            order?.totalPrice ??
            order?.totalAmount ??
            order?.grandTotal ??
            order?.total ??
            order?.amount ??
            0
        );

    }


    function getCustomerName(
        order
    ) {

        return (
            order?.customerName ||
            order?.user?.name ||
            order?.user?.username ||
            order?.shippingAddress?.name ||
            order?.customer?.name ||
            "Customer"
        );

    }


    function getCustomerEmail(
        order
    ) {

        return (
            order?.customerEmail ||
            order?.user?.email ||
            order?.customer?.email ||
            "-"
        );

    }


    function getCustomerPhone(
        order
    ) {

        return (
            order?.customerPhone ||
            order?.user?.phone ||
            order?.shippingAddress?.phone ||
            order?.customer?.phone ||
            "-"
        );

    }


    function getOrderCity(
        order
    ) {

        return (
            order?.city ||
            order?.shippingAddress?.city ||
            order?.address?.city ||
            "-"
        );

    }


    function getOrderId(
        order
    ) {

        return (
            order?._id ||
            order?.id ||
            ""
        );

    }


    function getPaymentMethod(
        order
    ) {

        return (
            order?.paymentMethod ||
            order?.payment?.method ||
            order?.paymentType ||
            "COD"
        );

    }


    function getTrackingNumber(
        order
    ) {

        return (
            order?.trackingNumber ||
            order?.trackingId ||
            order?.tracking?.number ||
            ""
        );

    }


    function renderOrders() {

        const tbody =
            $("ordersTableBody");


        if (!tbody) {

            return;

        }


        const statusFilter =
            $("orderStatusFilter")?.value ||
            "all";


        const search =
            (
                $("orderSearch")?.value ||
                ""
            )
                .trim()
                .toLowerCase();


        let orders =
            [...state.orders];


        if (
            statusFilter !==
            "all"
        ) {

            orders =
                orders.filter(
                    order =>
                        displayStatus(
                            order.status
                        ) ===
                        statusFilter
                );

        }


        if (search) {

            orders =
                orders.filter(
                    order => {

                        const text =
                            [
                                getOrderId(
                                    order
                                ),
                                getCustomerName(
                                    order
                                ),
                                getCustomerEmail(
                                    order
                                ),
                                getOrderCity(
                                    order
                                ),
                                getTrackingNumber(
                                    order
                                )
                            ]
                                .join(" ")
                                .toLowerCase();


                        return text.includes(
                            search
                        );

                    }
                );

        }


        if (!orders.length) {

            tbody.innerHTML =
                `
                <tr>
                    <td colspan="9">
                        <div class="empty-state">
                            <i class="ri-file-list-3-line"></i>
                            <strong>No orders found</strong>
                            <span>Try changing your search or filter.</span>
                        </div>
                    </td>
                </tr>
                `;

            return;

        }


        tbody.innerHTML =
            orders.map(
                order => {

                    const id =
                        getOrderId(
                            order
                        );


                    const status =
                        displayStatus(
                            order.status
                        );


                    const tracking =
                        getTrackingNumber(
                            order
                        );


                    return `
                    <tr>

                        <td>
                            <strong class="order-id">
                                #${escapeHtml(
                                    String(id).slice(-8)
                                )}
                            </strong>
                        </td>


                        <td>

                            <div class="customer-table-item">

                                <div class="customer-avatar">
                                    ${escapeHtml(
                                        getCustomerName(
                                            order
                                        )
                                            .charAt(0)
                                            .toUpperCase()
                                    )}
                                </div>

                                <div>

                                    <strong>
                                        ${escapeHtml(
                                            getCustomerName(
                                                order
                                            )
                                        )}
                                    </strong>

                                    <span>
                                        ${escapeHtml(
                                            getCustomerEmail(
                                                order
                                            )
                                        )}
                                    </span>

                                </div>

                            </div>

                        </td>


                        <td>
                            ${escapeHtml(
                                getOrderCity(
                                    order
                                )
                            )}
                        </td>


                        <td>
                            <strong>
                                ${formatMoney(
                                    getOrderTotal(
                                        order
                                    )
                                )}
                            </strong>
                        </td>


                        <td>
                            ${escapeHtml(
                                getPaymentMethod(
                                    order
                                )
                            )}
                        </td>


                        <td>

                            <span class="
                                status-badge
                                status-${normalizeStatus(
                                    order.status
                                )}
                            ">
                                ${escapeHtml(
                                    status
                                )}
                            </span>

                        </td>


                        <td>

                            ${
                                tracking
                                    ? `
                                    <span class="tracking-value">
                                        ${escapeHtml(
                                            tracking
                                        )}
                                    </span>
                                    `
                                    : `
                                    <span class="muted">
                                        Not added
                                    </span>
                                    `
                            }

                        </td>


                        <td>
                            ${formatDate(
                                order.createdAt ||
                                order.date
                            )}
                        </td>


                        <td>

                            <button
                                type="button"
                                class="table-action primary-action"
                                title="Manage order"
                                data-manage-order="${escapeHtml(
                                    id
                                )}"
                            >
                                <i class="ri-edit-line"></i>
                            </button>

                        </td>

                    </tr>
                    `;

                }
            ).join("");

    }


    function updateOrderSummary() {

        const processing =
            state.orders.filter(
                order =>
                    normalizeStatus(
                        order.status
                    ) ===
                    "processing"
            ).length;


        const shipped =
            state.orders.filter(
                order =>
                    normalizeStatus(
                        order.status
                    ) ===
                    "shipped"
            ).length;


        const delivered =
            state.orders.filter(
                order =>
                    normalizeStatus(
                        order.status
                    ) ===
                    "delivered"
            ).length;


        setText(
            "processingOrdersCount",
            processing
        );


        setText(
            "shippedOrdersCount",
            shipped
        );


        setText(
            "deliveredOrdersCount",
            delivered
        );


        setText(
            "totalOrdersManagement",
            state.orders.length
        );

    }


    /* =========================================================
       ORDER MODAL
       ========================================================= */

    function openOrderModal(
        orderId
    ) {

        const order =
            state.orders.find(
                item =>
                    String(
                        getOrderId(item)
                    ) ===
                    String(orderId)
            );


        if (!order) {

            showToast(
                "Order not found.",
                "error"
            );

            return;

        }


        state.currentOrder =
            order;


        setText(
            "modalOrderId",
            `#${String(
                getOrderId(order)
            ).slice(-8)}`
        );


        setText(
            "modalCustomerName",
            getCustomerName(
                order
            )
        );


        setText(
            "modalCustomerEmail",
            getCustomerEmail(
                order
            )
        );


        const status =
            $("modalOrderStatus");


        if (status) {

            status.value =
                displayStatus(
                    order.status
                );

        }


        const tracking =
            $("modalTrackingNumber");


        if (tracking) {

            tracking.value =
                getTrackingNumber(
                    order
                );

        }


        const trackingUrl =
            $("modalTrackingUrl");


        if (trackingUrl) {

            trackingUrl.value =
                order?.trackingUrl ||
                order?.tracking?.url ||
                "";

        }


        const modal =
            $("orderManagementModal");


        if (!modal) {

            return;

        }


        modal.classList.add(
            "show"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        modal.removeAttribute(
            "inert"
        );


        document.body.classList.add(
            "modal-open"
        );


        setTimeout(
            () => {

                qs(
                    ".admin-modal-box",
                    modal
                )?.focus();

            },
            50
        );

    }


    function closeOrderModal() {

        const modal =
            $("orderManagementModal");


        if (!modal) {

            return;

        }


        modal.classList.remove(
            "show"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );


        modal.setAttribute(
            "inert",
            ""
        );


        document.body.classList.remove(
            "modal-open"
        );


        state.currentOrder =
            null;

    }

async function saveOrderUpdate() {

    const order =
        state.currentOrder;


    if (!order) {

        return;

    }


    const id =
        getOrderId(
            order
        );


    if (!id) {

        showToast(
            "Order ID is missing.",
            "error"
        );

        return;

    }


    const button =
        $("saveOrderUpdate");


    const status =
        $("modalOrderStatus")?.value ||
        "";


    const trackingNumber =
        $("modalTrackingNumber")?.value.trim() ||
        "";


    const trackingUrl =
        $("modalTrackingUrl")?.value.trim() ||
        "";


    if (!status) {

        showToast(
            "Please select an order status.",
            "error"
        );

        return;

    }


    /*
     * Tracking is required when shipping.
     */

    if (
        status === "Shipped" &&
        !trackingNumber &&
        !trackingUrl
    ) {

        showToast(
            "Tracking ID or Tracking URL is required when order is shipped.",
            "error"
        );

        return;

    }


    setButtonLoading(
        button,
        true,
        "Updating..."
    );


    try {

        /*
         * Backend:
         *
         * PATCH /api/orders/:id/status
         */

        const payload = {

            status:
                status,

            trackingNumber:
                trackingNumber,

            trackingUrl:
                trackingUrl

        };


        const response =
            await apiRequest(
                `/orders/${encodeURIComponent(
                    id
                )}/status`,
                {

                    method:
                        "PATCH",

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        /*
         * Update local order from
         * backend response.
         */

        const updatedOrder =
            response?.order;


        if (updatedOrder) {

            /*
             * Replace current order.
             */

            state.currentOrder =
                updatedOrder;


            /*
             * Replace matching order
             * inside state.orders.
             */

            const index =
                state.orders.findIndex(
                    item =>
                        String(
                            getOrderId(
                                item
                            )
                        ) ===
                        String(id)
                );


            if (index !== -1) {

                state.orders[index] =
                    updatedOrder;

            }

        }
        else {

            /*
             * Fallback if backend does not
             * return updated order.
             */

            order.status =
                status;


            order.trackingNumber =
                trackingNumber;


            order.trackingUrl =
                trackingUrl;

        }


        showToast(
            response?.message ||
            "Order updated successfully."
        );


        /*
         * Close modal.
         */

        closeOrderModal();


        /*
         * Refresh UI.
         */

        renderOrders();

        updateOrderSummary();

        renderRecentOrders();

        renderOrderStatus();

        updateDashboardStats();

        updateNotifications();

    }
    catch (error) {

        console.error(
            "Order update error:",
            error
        );


        showToast(
            error.message ||
            "Order update failed.",
            "error"
        );

    }
    finally {

        setButtonLoading(
            button,
            false
        );

    }

}
    /* =========================================================
       RECENT ORDERS
       ========================================================= */

    function renderRecentOrders() {

        const tbody =
            $("recentOrdersBody");


        if (!tbody) {

            return;

        }


        const orders =
            [...state.orders]
                .sort(
                    (
                        a,
                        b
                    ) =>
                        new Date(
                            b.createdAt ||
                            b.date ||
                            0
                        ) -
                        new Date(
                            a.createdAt ||
                            a.date ||
                            0
                        )
                )
                .slice(
                    0,
                    6
                );


        if (!orders.length) {

            tbody.innerHTML =
                `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <i class="ri-file-list-3-line"></i>
                            <strong>No recent orders</strong>
                        </div>
                    </td>
                </tr>
                `;

            return;

        }


        tbody.innerHTML =
            orders.map(
                order => {

                    const id =
                        getOrderId(
                            order
                        );


                    return `
                    <tr>

                        <td>
                            ${escapeHtml(
                                getCustomerName(
                                    order
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                getOrderCity(
                                    order
                                )
                            )}
                        </td>

                        <td>
                            ${formatMoney(
                                getOrderTotal(
                                    order
                                )
                            )}
                        </td>

                        <td>

                            <span class="
                                status-badge
                                status-${normalizeStatus(
                                    order.status
                                )}
                            ">
                                ${escapeHtml(
                                    displayStatus(
                                        order.status
                                    )
                                )}
                            </span>

                        </td>

                        <td>
                            ${formatDate(
                                order.createdAt ||
                                order.date
                            )}
                        </td>

                        <td>

                            <button
                                type="button"
                                class="table-action primary-action"
                                data-manage-order="${escapeHtml(
                                    id
                                )}"
                            >
                                <i class="ri-arrow-right-line"></i>
                            </button>

                        </td>

                    </tr>
                    `;

                }
            ).join("");

    }


    /* =========================================================
       LOW STOCK
       ========================================================= */

    function renderLowStock() {

        const container =
            $("lowStockList");


        if (!container) {

            return;

        }


        const products =
            state.products
                .filter(
                    product =>
                        getProductStock(
                            product
                        ) <=
                        CONFIG.LOW_STOCK_LIMIT
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        getProductStock(a) -
                        getProductStock(b)
                )
                .slice(
                    0,
                    6
                );


        if (!products.length) {

            container.innerHTML =
                `
                <div class="empty-state compact">
                    <i class="ri-checkbox-circle-line"></i>
                    <strong>Inventory looks healthy</strong>
                    <span>No low-stock products.</span>
                </div>
                `;

            return;

        }


        container.innerHTML =
            products.map(
                product => {

                    const stock =
                        getProductStock(
                            product
                        );


                    const image =
                        getProductImage(
                            product
                        );


                    return `
                    <div class="stock-item">

                        ${
                            image
                                ? `
                                <img
                                    src="${escapeHtml(image)}"
                                    alt="${escapeHtml(
                                        product.name
                                    )}"
                                    onerror="this.style.display='none'"
                                >
                                `
                                : `
                                <div class="stock-image-placeholder">
                                    <i class="ri-image-line"></i>
                                </div>
                                `
                        }

                        <div class="stock-info">

                            <strong>
                                ${escapeHtml(
                                    product.name ||
                                    "Product"
                                )}
                            </strong>

                            <span>
                                ${stock} units left
                            </span>

                        </div>

                        <span class="
                            stock-pill
                            ${
                                stock <= 0
                                    ? "out"
                                    : "low"
                            }
                        ">
                            ${stock}
                        </span>

                    </div>
                    `;

                }
            ).join("");

    }


    /* =========================================================
       ORDER STATUS CHART
       ========================================================= */

    function getOrderStatusCounts() {

        const counts = {

            pending: 0,

            processing: 0,

            confirmed: 0,

            shipped: 0,

            delivered: 0,

            cancelled: 0

        };


        state.orders.forEach(
            order => {

                const status =
                    normalizeStatus(
                        order.status
                    );


                if (
                    counts[
                        status
                    ] !== undefined
                ) {

                    counts[
                        status
                    ]++;

                }

            }
        );


        return counts;

    }


    function renderOrderStatus() {

        const counts =
            getOrderStatusCounts();


        const total =
            state.orders.length;


        setText(
            "statusTotal",
            total
        );


        const list =
            $("statusList");


        const entries = [

            [
                "pending",
                "Pending"
            ],

            [
                "processing",
                "Processing"
            ],

            [
                "confirmed",
                "Confirmed"
            ],

            [
                "shipped",
                "Shipped"
            ],

            [
                "delivered",
                "Delivered"
            ],

            [
                "cancelled",
                "Cancelled"
            ]

        ];


        if (list) {

            list.innerHTML =
                entries
                    .filter(
                        ([key]) =>
                            counts[key] >
                            0
                    )
                    .map(
                        ([key, label]) =>
                            `
                            <div class="status-row">

                                <div>

                                    <span class="
                                        status-dot
                                        status-dot-${key}
                                    "></span>

                                    <span>
                                        ${label}
                                    </span>

                                </div>

                                <strong>
                                    ${counts[key]}
                                </strong>

                            </div>
                            `
                    )
                    .join("") ||
                `
                <div class="empty-state compact">
                    No orders yet.
                </div>
                `;

        }


        const labels =
            entries.map(
                ([, label]) =>
                    label
            );


        const data =
            entries.map(
                ([key]) =>
                    counts[key]
            );


        createChart(
            "orderStatusChart",
            {

                type: "doughnut",

                data: {

                    labels,

                    datasets: [
                        {
                            data,

                            borderWidth: 0
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "72%",

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            }
        );

    }


    /* =========================================================
       DASHBOARD CHARTS
       ========================================================= */

    function renderDashboardCharts() {

        createMiniChart(
            "productsMiniChart",
            state.products.length
        );


        createMiniChart(
            "ordersMiniChart",
            state.orders.length
        );


        createMiniChart(
            "customersMiniChart",
            state.customers.length
        );


        const revenue =
            state.orders.reduce(
                (
                    total,
                    order
                ) =>
                    normalizeStatus(
                        order.status
                    ) ===
                    "cancelled"
                        ? total
                        : total +
                          getOrderTotal(
                              order
                          ),
                0
            );


        createMiniChart(
            "revenueMiniChart",
            revenue
        );


        renderSalesChart();

    }


    function createMiniChart(
        canvasId,
        value
    ) {

        const points = [
            value * 0.60,
            value * 0.72,
            value * 0.68,
            value * 0.82,
            value * 0.78,
            value * 0.94,
            value
        ];


        createChart(
            canvasId,
            {

                type: "line",

                data: {

                    labels: [
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        ""
                    ],

                    datasets: [
                        {

                            data: points,

                            borderWidth: 2,

                            pointRadius: 0,

                            tension: 0.45,

                            fill: true

                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip: {
                            enabled: false
                        }

                    },

                    scales: {

                        x: {
                            display: false
                        },

                        y: {
                            display: false
                        }

                    },

                    elements: {

                        line: {
                            borderWidth: 2
                        }

                    }

                }

            }
        );

    }


    function renderSalesChart() {

        const period =
            $("salesPeriod")?.value ||
            "week";


        const grouped =
            buildSalesData(
                period
            );


        createChart(
            "salesChart",
            {

                type: "line",

                data: {

                    labels:
                        grouped.labels,

                    datasets: [
                        {

                            label:
                                "Revenue",

                            data:
                                grouped.values,

                            borderWidth:
                                2.5,

                            tension:
                                0.4,

                            fill:
                                true,

                            pointRadius:
                                3,

                            pointHoverRadius:
                                5

                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {

                        mode:
                            "index",

                        intersect:
                            false

                    },

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    value =>
                                        "Rs. " +
                                        Number(
                                            value
                                        ).toLocaleString(
                                            "en-PK"
                                        )

                            }

                        }

                    }

                }

            }
        );

    }


    function buildSalesData(
        period
    ) {

        const now =
            new Date();


        let labels = [];

        let values = [];


        if (
            period ===
            "year"
        ) {

            labels = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec"
            ];


            values =
                new Array(12).fill(0);


            state.orders.forEach(
                order => {

                    if (
                        normalizeStatus(
                            order.status
                        ) ===
                        "cancelled"
                    ) {

                        return;

                    }


                    const date =
                        new Date(
                            order.createdAt ||
                            order.date ||
                            now
                        );


                    if (
                        date.getFullYear() ===
                        now.getFullYear()
                    ) {

                        values[
                            date.getMonth()
                        ] +=
                            getOrderTotal(
                                order
                            );

                    }

                }
            );

        }
        else {

            const days =
                period ===
                "month"
                    ? 30
                    : 7;


            for (
                let i = days - 1;
                i >= 0;
                i--
            ) {

                const date =
                    new Date(
                        now
                    );


                date.setDate(
                    now.getDate() -
                    i
                );


                labels.push(
                    date.toLocaleDateString(
                        "en-PK",
                        {
                            day: "numeric",
                            month: "short"
                        }
                    )
                );


                const key =
                    date.toISOString()
                        .slice(
                            0,
                            10
                        );


                let total =
                    0;


                state.orders.forEach(
                    order => {

                        if (
                            normalizeStatus(
                                order.status
                            ) ===
                            "cancelled"
                        ) {

                            return;

                        }


                        const orderDate =
                            new Date(
                                order.createdAt ||
                                order.date ||
                                0
                            );


                        if (
                            orderDate
                                .toISOString()
                                .slice(
                                    0,
                                    10
                                ) ===
                            key
                        ) {

                            total +=
                                getOrderTotal(
                                    order
                                );

                        }

                    }
                );


                values.push(
                    total
                );

            }

        }


        return {
            labels,
            values
        };

    }


    /* =========================================================
       CUSTOMERS
       ========================================================= */
async function loadCustomers() {

    try {

        let response;


        try {

            response =
                await apiGet(
                    "/auth/users"
                );


        }
        catch (firstError) {

            console.warn(
                "Primary users route failed, trying /users...",
                firstError
            );


            response =
                await apiGet(
                    "/users"
                );

        }


        console.log(
            "CUSTOMERS API RESPONSE:",
            response
        );


        state.customers =
            extractArray(
                response
            );


        console.log(
            "CUSTOMERS ARRAY:",
            state.customers
        );


        renderCustomers();

        updateDashboardStats();


        return state.customers;

    }
    catch (error) {

        console.error(
            "Customers error:",
            error
        );


        const tbody =
            $("usersTable");


        if (tbody) {

            tbody.innerHTML =
                `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <i class="ri-error-warning-line"></i>

                            <strong>
                                Unable to load customers
                            </strong>

                            <span>
                                ${escapeHtml(
                                    error.message
                                )}
                            </span>

                        </div>
                    </td>
                </tr>
                `;

        }


        return [];

    }

}


    function renderCustomers(
        customers = state.customers
    ) {

        const tbody =
            $("usersTable");


        if (!tbody) {

            return;

        }


        const search =
            (
                $("customerSearch")?.value ||
                ""
            )
                .trim()
                .toLowerCase();


        let list =
            [...customers];


        if (search) {

            list =
                list.filter(
                    customer => {

                        const text =
                            [
                                customer.name,
                                customer.email,
                                customer.phone
                            ]
                                .join(" ")
                                .toLowerCase();


                        return text.includes(
                            search
                        );

                    }
                );

        }


        if (!list.length) {

            tbody.innerHTML =
                `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <i class="ri-group-line"></i>
                            <strong>No customers found</strong>
                        </div>
                    </td>
                </tr>
                `;

            return;

        }


        tbody.innerHTML =
            list.map(
                customer => {

                    const name =
                        customer.name ||
                        customer.username ||
                        "Customer";


                    const id =
                        customer._id ||
                        customer.id ||
                        "";


                    return `
                    <tr>

                        <td>

                            <div class="customer-table-item">

                                <div class="customer-avatar">
                                    ${escapeHtml(
                                        name
                                            .charAt(0)
                                            .toUpperCase()
                                    )}
                                </div>

                                <div>

                                    <strong>
                                        ${escapeHtml(
                                            name
                                        )}
                                    </strong>

                                    <span>
                                        #${escapeHtml(
                                            String(
                                                id
                                            ).slice(-8)
                                        )}
                                    </span>

                                </div>

                            </div>

                        </td>


                        <td>
                            ${escapeHtml(
                                customer.email ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${escapeHtml(
                                customer.phone ||
                                "-"
                            )}
                        </td>


                        <td>
                            ${Number(
                                customer.ordersCount ||
                                customer.totalOrders ||
                                0
                            )}
                        </td>


                        <td>
                            ${formatDate(
                                customer.createdAt ||
                                customer.createdDate
                            )}
                        </td>


                        <td>

                            <button
                                type="button"
                                class="table-action"
                                data-customer-id="${escapeHtml(
                                    id
                                )}"
                            >
                                <i class="ri-eye-line"></i>
                            </button>

                        </td>

                    </tr>
                    `;

                }
            ).join("");

    }


    /* =========================================================
       ANALYTICS
       ========================================================= */

    async function loadAnalytics() {

        /*
         * Use already loaded data where possible.
         * This prevents unnecessary API calls.
         */

        if (!state.products.length) {

            await loadProducts();

        }


        if (!state.orders.length) {

            await loadOrders();

        }


        if (!state.customers.length) {

            await loadCustomers();

        }


        renderAnalytics();

    }


    function renderAnalytics() {

        const validOrders =
            state.orders.filter(
                order =>
                    normalizeStatus(
                        order.status
                    ) !==
                    "cancelled"
            );


        const totalSales =
            validOrders.reduce(
                (
                    total,
                    order
                ) =>
                    total +
                    getOrderTotal(
                        order
                    ),
                0
            );


        const totalOrders =
            validOrders.length;


        const averageOrder =
            totalOrders
                ? totalSales /
                  totalOrders
                : 0;


        const conversion =
            state.customers.length
                ? (
                    totalOrders /
                    state.customers.length
                  ) *
                  100
                : 0;


        setText(
            "analyticsTotalSales",
            formatMoney(
                totalSales
            )
        );


        setText(
            "analyticsTotalOrders",
            totalOrders
        );


        setText(
            "analyticsAverageOrder",
            formatMoney(
                averageOrder
            )
        );


        setText(
            "analyticsConversion",
            `${conversion.toFixed(1)}%`
        );


        renderAnalyticsChart();

        renderAnalyticsOrderChart();

        renderCategoryChart();

        renderTopProducts();

        renderInsights();

    }


    function renderAnalyticsChart() {

        const period =
            $("analyticsPeriod")?.value ||
            "week";


        const data =
            buildSalesData(
                period === "month"
                    ? "month"
                    : period === "year"
                        ? "year"
                        : "week"
            );


        createChart(
            "analyticsChart",
            {

                type: "line",

                data: {

                    labels:
                        data.labels,

                    datasets: [
                        {

                            label:
                                "Revenue",

                            data:
                                data.values,

                            borderWidth:
                                2.5,

                            tension:
                                0.4,

                            fill:
                                true,

                            pointRadius:
                                3

                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    value =>
                                        "Rs. " +
                                        Number(
                                            value
                                        ).toLocaleString(
                                            "en-PK"
                                        )

                            }

                        }

                    }

                }

            }
        );

    }


    function renderAnalyticsOrderChart() {

        const counts =
            getOrderStatusCounts();


        const labels = [
            "Pending",
            "Processing",
            "Confirmed",
            "Shipped",
            "Delivered",
            "Cancelled"
        ];


        const values = [
            counts.pending,
            counts.processing,
            counts.confirmed,
            counts.shipped,
            counts.delivered,
            counts.cancelled
        ];


        setText(
            "analyticsOrderTotal",
            state.orders.length
        );


        createChart(
            "analyticsOrderChart",
            {

                type: "doughnut",

                data: {

                    labels,

                    datasets: [
                        {

                            data: values,

                            borderWidth: 0

                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "70%",

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            }
        );


        const list =
            $("analyticsStatusList");


        if (list) {

            list.innerHTML =
                labels.map(
                    (
                        label,
                        index
                    ) =>
                        `
                        <div class="analytics-status-row">

                            <span>
                                ${escapeHtml(
                                    label
                                )}
                            </span>

                            <strong>
                                ${values[index]}
                            </strong>

                        </div>
                        `
                ).join("");

        }

    }


    function renderCategoryChart() {

        const categories = {};


        state.products.forEach(
            product => {

                const category =
                    product.category ||
                    "Other";


                categories[
                    category
                ] =
                    (
                        categories[
                            category
                        ] ||
                        0
                    ) + 1;

            }
        );


        const labels =
            Object.keys(
                categories
            );


        const values =
            Object.values(
                categories
            );


        createChart(
            "categoryChart",
            {

                type: "bar",

                data: {

                    labels,

                    datasets: [
                        {

                            label:
                                "Products",

                            data:
                                values,

                            borderRadius:
                                8,

                            borderSkipped:
                                false

                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {
                                precision: 0
                            }

                        }

                    }

                }

            }
        );

    }


    function renderTopProducts() {

        const container =
            $("topProductsList");


        if (!container) {

            return;

        }


        /*
         * If backend contains sales count
         * use it. Otherwise show products
         * based on available fields.
         */

        const products =
            [...state.products]
                .sort(
                    (
                        a,
                        b
                    ) =>
                        Number(
                            b.sales ||
                            b.sold ||
                            b.totalSold ||
                            0
                        ) -
                        Number(
                            a.sales ||
                            a.sold ||
                            a.totalSold ||
                            0
                        )
                )
                .slice(
                    0,
                    6
                );


        if (!products.length) {

            container.innerHTML =
                `
                <div class="empty-state compact">
                    No product data available.
                </div>
                `;

            return;

        }


        container.innerHTML =
            products.map(
                (
                    product,
                    index
                ) => {

                    const image =
                        getProductImage(
                            product
                        );


                    const sold =
                        Number(
                            product.sales ||
                            product.sold ||
                            product.totalSold ||
                            0
                        );


                    return `
                    <div class="top-product-item">

                        <span class="rank">
                            ${index + 1}
                        </span>

                        ${
                            image
                                ? `
                                <img
                                    src="${escapeHtml(image)}"
                                    alt="${escapeHtml(
                                        product.name
                                    )}"
                                    onerror="this.style.display='none'"
                                >
                                `
                                : `
                                <div class="top-product-placeholder">
                                    <i class="ri-image-line"></i>
                                </div>
                                `
                        }

                        <div>

                            <strong>
                                ${escapeHtml(
                                    product.name ||
                                    "Product"
                                )}
                            </strong>

                            <span>
                                ${sold} sold
                            </span>

                        </div>

                    </div>
                    `;

                }
            ).join("");

    }


    function renderInsights() {

        const container =
            $("analyticsInsights");


        if (!container) {

            return;

        }


        const lowStock =
            state.products.filter(
                product =>
                    getProductStock(
                        product
                    ) <=
                    CONFIG.LOW_STOCK_LIMIT
            ).length;


        const delivered =
            state.orders.filter(
                order =>
                    normalizeStatus(
                        order.status
                    ) ===
                    "delivered"
            ).length;


        const cancelled =
            state.orders.filter(
                order =>
                    normalizeStatus(
                        order.status
                    ) ===
                    "cancelled"
            ).length;


        const insights = [

            {
                icon:
                    "ri-stock-line",

                title:
                    "Inventory",

                text:
                    lowStock
                        ? `${lowStock} product${lowStock > 1 ? "s are" : " is"} running low on stock.`
                        : "Your inventory is currently healthy."
            },


            {
                icon:
                    "ri-checkbox-circle-line",

                title:
                    "Delivery",

                text:
                    `${delivered} order${delivered === 1 ? "" : "s"} delivered successfully.`
            },


            {
                icon:
                    "ri-close-circle-line",

                title:
                    "Cancelled",

                text:
                    `${cancelled} cancelled order${cancelled === 1 ? "" : "s"} recorded.`
            }

        ];


        container.innerHTML =
            insights.map(
                insight =>
                    `
                    <div class="insight-card">

                        <div class="insight-icon">
                            <i class="${insight.icon}"></i>
                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(
                                    insight.title
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    insight.text
                                )}
                            </span>

                        </div>

                    </div>
                    `
            ).join("");

    }


    /* =========================================================
       HOMEPAGE
       ========================================================= */

    async function loadHomepageProducts() {

        if (!state.products.length) {

            await loadProducts();

        }


        state.homepageProducts =
            state.products.filter(
                product =>
                    product.showOnHome ===
                        true ||
                    product.showOnHome ===
                        "true" ||
                    product.isFeatured ===
                        true
            );


        state.featuredProducts =
            state.products.filter(
                product =>
                    product.featured ===
                        true ||
                    product.isFeatured ===
                        true
            );


        renderHomepageProductData();

    }


    function renderHomepageProductData() {

        renderHomepageList(
            "homepageProducts",
            state.homepageProducts
        );


        renderHomepageList(
            "featuredProducts",
            state.featuredProducts
        );

    }


    function renderHomepageList(
        containerId,
        products
    ) {

        const container =
            $(containerId);


        if (!container) {

            return;

        }


        if (!products.length) {

            container.innerHTML =
                `
                <div class="empty-state compact">
                    <i class="ri-home-5-line"></i>
                    <strong>No products selected</strong>
                    <span>Use product settings to feature products.</span>
                </div>
                `;

            return;

        }


        container.innerHTML =
            products.map(
                product => {

                    const image =
                        getProductImage(
                            product
                        );


                    return `
                    <div class="homepage-product-item">

                        ${
                            image
                                ? `
                                <img
                                    src="${escapeHtml(image)}"
                                    alt="${escapeHtml(
                                        product.name
                                    )}"
                                >
                                `
                                : `
                                <div class="homepage-placeholder">
                                    <i class="ri-image-line"></i>
                                </div>
                                `
                        }

                        <div>

                            <strong>
                                ${escapeHtml(
                                    product.name
                                )}
                            </strong>

                            <span>
                                ${formatMoney(
                                    getProductPrice(
                                        product
                                    )
                                )}
                            </span>

                        </div>

                    </div>
                    `;

                }
            ).join("");

    }


    /* =========================================================
       SEARCH
       ========================================================= */

    function buildSearchResults(
        query = ""
    ) {

        const search =
            String(
                query
            )
                .trim()
                .toLowerCase();


        const container =
            $("searchResults");


        if (!container) {

            return;

        }


        if (!search) {

            container.innerHTML =
                "";

            container.classList.remove(
                "show"
            );

            return;

        }


        const productResults =
            state.products
                .filter(
                    product =>
                        [
                            product.name,
                            product.brand,
                            product.category
                        ]
                            .join(" ")
                            .toLowerCase()
                            .includes(
                                search
                            )
                )
                .slice(
                    0,
                    5
                );


        const orderResults =
            state.orders
                .filter(
                    order =>
                        [
                            getOrderId(order),
                            getCustomerName(order),
                            getCustomerEmail(order),
                            getOrderCity(order)
                        ]
                            .join(" ")
                            .toLowerCase()
                            .includes(
                                search
                            )
                )
                .slice(
                    0,
                    5
                );


        let html = "";


        productResults.forEach(
            product => {

                html +=
                    `
                    <button
                        type="button"
                        class="search-result-item"
                        data-search-product="${escapeHtml(
                            product._id ||
                            product.id ||
                            ""
                        )}"
                    >

                        <i class="ri-shopping-bag-3-line"></i>

                        <span>

                            <strong>
                                ${escapeHtml(
                                    product.name
                                )}
                            </strong>

                            <small>
                                Product · ${escapeHtml(
                                    product.category ||
                                    ""
                                )}
                            </small>

                        </span>

                    </button>
                    `;

            }
        );


        orderResults.forEach(
            order => {

                html +=
                    `
                    <button
                        type="button"
                        class="search-result-item"
                        data-search-order="${escapeHtml(
                            getOrderId(order)
                        )}"
                    >

                        <i class="ri-file-list-3-line"></i>

                        <span>

                            <strong>
                                #${escapeHtml(
                                    String(
                                        getOrderId(order)
                                    ).slice(-8)
                                )}
                            </strong>

                            <small>
                                Order · ${escapeHtml(
                                    getCustomerName(
                                        order
                                    )
                                )}
                            </small>

                        </span>

                    </button>
                    `;

            }
        );


        if (!html) {

            html =
                `
                <div class="search-empty">
                    No results found.
                </div>
                `;

        }


        container.innerHTML =
            html;


        container.classList.add(
            "show"
        );

    }


    /* =========================================================
       NOTIFICATIONS
       ========================================================= */

    function updateNotifications() {

        const notifications = [];


        const pending =
            state.orders.filter(
                order =>
                    normalizeStatus(
                        order.status
                    ) ===
                    "pending"
            ).length;


        if (pending > 0) {

            notifications.push(
                {
                    icon:
                        "ri-file-list-3-line",

                    title:
                        "Pending orders",

                    text:
                        `${pending} order${pending > 1 ? "s are" : " is"} waiting for confirmation.`

                }
            );

        }


        const lowStock =
            state.products.filter(
                product =>
                    getProductStock(
                        product
                    ) <=
                    CONFIG.LOW_STOCK_LIMIT
            ).length;


        if (lowStock > 0) {

            notifications.push(
                {
                    icon:
                        "ri-alert-line",

                    title:
                        "Low stock alert",

                    text:
                        `${lowStock} product${lowStock > 1 ? "s have" : " has"} low stock.`

                }
            );

        }


        state.notifications =
            notifications;


        renderNotifications();

    }


    function renderNotifications() {

        const list =
            $("notificationList");


        const count =
            $("notificationCount");


        if (count) {

            count.textContent =
                state.notifications.length;

            count.style.display =
                state.notifications.length
                    ? ""
                    : "none";

        }


        if (!list) {

            return;

        }


        if (
            !state.notifications.length
        ) {

            list.innerHTML =
                `
                <div class="empty-state compact">
                    <i class="ri-notification-off-line"></i>
                    <strong>No new notifications</strong>
                </div>
                `;

            return;

        }


        list.innerHTML =
            state.notifications.map(
                notification =>
                    `
                    <div class="notification-item">

                        <div class="notification-icon">
                            <i class="${notification.icon}"></i>
                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(
                                    notification.title
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    notification.text
                                )}
                            </span>

                        </div>

                    </div>
                    `
            ).join("");

    }


    /* =========================================================
       SETTINGS
       ========================================================= */

    function loadSettings() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        "zmAdminSettings"
                    ) ||
                    "{}"
                );


            if (
                saved.storeName &&
                $("settingStoreName")
            ) {

                $("settingStoreName").value =
                    saved.storeName;

            }


            if (
                saved.email &&
                $("settingStoreEmail")
            ) {

                $("settingStoreEmail").value =
                    saved.email;

            }


            if (
                saved.phone &&
                $("settingStorePhone")
            ) {

                $("settingStorePhone").value =
                    saved.phone;

            }


            if (
                saved.address &&
                $("settingStoreAddress")
            ) {

                $("settingStoreAddress").value =
                    saved.address;

            }


            [
                "emailNotifications",
                "lowStockAlerts",
                "orderNotifications"
            ].forEach(
                id => {

                    if (
                        saved[id] !==
                        undefined &&
                        $(id)
                    ) {

                        $(id).checked =
                            Boolean(
                                saved[id]
                            );

                    }

                }
            );

        }
        catch (error) {

            console.warn(
                "Settings load warning:",
                error
            );

        }

    }


    function saveSettings() {

        const settings = {

            storeName:
                $("settingStoreName")?.value ||
                "",

            email:
                $("settingStoreEmail")?.value ||
                "",

            phone:
                $("settingStorePhone")?.value ||
                "",

            address:
                $("settingStoreAddress")?.value ||
                "",

            emailNotifications:
                $("emailNotifications")?.checked ||
                false,

            lowStockAlerts:
                $("lowStockAlerts")?.checked ||
                false,

            orderNotifications:
                $("orderNotifications")?.checked ||
                false

        };


        localStorage.setItem(
            "zmAdminSettings",
            JSON.stringify(
                settings
            )
        );


        showToast(
            "Settings saved successfully."
        );

    }


    /* =========================================================
       LOGOUT
       ========================================================= */

    function logout() {

        const confirmed =
            window.confirm(
                "Are you sure you want to logout?"
            );


        if (!confirmed) {

            return;

        }


        [
            "token",
            "adminToken",
            "authToken",
            "user",
            "admin",
            "currentUser"
        ].forEach(
            key =>
                localStorage.removeItem(
                    key
                )
        );


        window.location.replace =
            "login.html";

    }


    /* =========================================================
       EVENT LISTENERS
       ========================================================= */

    function bindEvents() {

        /*
         * Sidebar navigation
         */

        qsa(
            ".nav-item[data-page]"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        navigateTo(
                            button.dataset.page
                        );

                    }
                );

            }
        );


        /*
         * Menu
         */

        $("menuToggle")
            ?.addEventListener(
                "click",
                toggleSidebar
            );


        $("closeSidebar")
            ?.addEventListener(
                "click",
                closeSidebar
            );


        $("sidebarOverlay")
            ?.addEventListener(
                "click",
                closeSidebar
            );


        /*
         * User menu
         */

        $("userMoreBtn")
            ?.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    closeFloatingPanels();

                    $("sidebarUserMenu")
                        ?.classList.toggle(
                            "show"
                        );

                }
            );


        $("profileButton")
            ?.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    $("notificationPanel")
                        ?.classList.remove(
                            "show"
                        );


                    $("sidebarUserMenu")
                        ?.classList.remove(
                            "show"
                        );


                    $("profileDropdown")
                        ?.classList.toggle(
                            "show"
                        );

                }
            );


        /*
         * Notification
         */

        $("notificationBtn")
            ?.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    $("profileDropdown")
                        ?.classList.remove(
                            "show"
                        );


                    $("notificationPanel")
                        ?.classList.toggle(
                            "show"
                        );

                }
            );


        $("clearNotifications")
            ?.addEventListener(
                "click",
                () => {

                    state.notifications =
                        [];


                    renderNotifications();

                }
            );


        /*
         * Logout
         */

        $("logoutBtn")
            ?.addEventListener(
                "click",
                logout
            );


        $("profileLogout")
            ?.addEventListener(
                "click",
                logout
            );


        /*
         * Dropdown settings
         */

        qsa(
            ".dropdown-link[data-page]"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        navigateTo(
                            button.dataset.page
                        );

                        closeFloatingPanels();

                    }
                );

            }
        );


        /*
         * Refresh dashboard
         */

        $("refreshBtn")
            ?.addEventListener(
                "click",
                async () => {

                    const button =
                        $("refreshBtn");


                    setButtonLoading(
                        button,
                        true,
                        "Refreshing..."
                    );


                    try {

                        await loadDashboard();

                        showToast(
                            "Dashboard refreshed."
                        );

                    }
                    catch (error) {

                        showToast(
                            error.message,
                            "error"
                        );

                    }
                    finally {

                        setButtonLoading(
                            button,
                            false
                        );

                    }

                }
            );


        /*
         * Add product buttons
         */

        $("productsAddBtn")
            ?.addEventListener(
                "click",
                () => {

                    resetProductForm();

                    navigateTo(
                        "add-product"
                    );

                }
            );


        $("cancelProductBtn")
            ?.addEventListener(
                "click",
                () => {

                    resetProductForm();

                    navigateTo(
                        "products"
                    );

                }
            );


        /*
         * Product category
         */

        $("productCategory")
            ?.addEventListener(
                "change",
                updateSubCategories
            );


        /*
         * Product images
         */

        $("productImage")
            ?.addEventListener(
                "change",
                handleImageSelection
            );


        /*
         * Product form
         */

        $("productForm")
            ?.addEventListener(
                "submit",
                handleProductSubmit
            );


        /*
         * Product search
         */

        $("productSearch")
            ?.addEventListener(
                "input",
                event => {

                    const query =
                        event.target.value
                            .trim()
                            .toLowerCase();


                    const filtered =
                        state.products.filter(
                            product =>
                                [
                                    product.name,
                                    product.brand,
                                    product.category
                                ]
                                    .join(" ")
                                    .toLowerCase()
                                    .includes(
                                        query
                                    )
                        );


                    renderProducts(
                        filtered
                    );

                }
            );


        /*
         * Orders
         */

        $("orderStatusFilter")
            ?.addEventListener(
                "change",
                renderOrders
            );


        $("orderSearch")
            ?.addEventListener(
                "input",
                renderOrders
            );


        /*
         * Customers
         */

        $("customerSearch")
            ?.addEventListener(
                "input",
                () =>
                    renderCustomers()
            );


        /*
         * Sales period
         */

        $("salesPeriod")
            ?.addEventListener(
                "change",
                renderSalesChart
            );


        /*
         * Analytics
         */

        $("analyticsPeriod")
            ?.addEventListener(
                "change",
                renderAnalytics
            );


        $("refreshAnalyticsBtn")
            ?.addEventListener(
                "click",
                async () => {

                    const button =
                        $("refreshAnalyticsBtn");


                    setButtonLoading(
                        button,
                        true,
                        "Refreshing..."
                    );


                    try {

                        await Promise.all([
                            loadProducts(),
                            loadOrders(),
                            loadCustomers()
                        ]);


                        renderAnalytics();


                        showToast(
                            "Analytics refreshed."
                        );

                    }
                    catch (error) {

                        showToast(
                            error.message,
                            "error"
                        );

                    }
                    finally {

                        setButtonLoading(
                            button,
                            false
                        );

                    }

                }
            );


        /*
         * Dashboard view buttons
         */

        $("viewOrdersBtn")
            ?.addEventListener(
                "click",
                () =>
                    navigateTo(
                        "orders"
                    )
            );


        $("viewProductsBtn")
            ?.addEventListener(
                "click",
                () =>
                    navigateTo(
                        "products"
                    )
            );


        /*
         * Settings
         */

        $("saveStoreSettings")
            ?.addEventListener(
                "click",
                saveSettings
            );


        /*
         * Order modal
         */

        $("closeOrderModal")
            ?.addEventListener(
                "click",
                closeOrderModal
            );


        $("cancelOrderUpdate")
            ?.addEventListener(
                "click",
                closeOrderModal
            );


        $("orderModalOverlay")
            ?.addEventListener(
                "click",
                closeOrderModal
            );


        $("saveOrderUpdate")
            ?.addEventListener(
                "click",
                saveOrderUpdate
            );


        /*
         * Global search
         */

        $("globalSearch")
            ?.addEventListener(
                "input",
                event =>
                    buildSearchResults(
                        event.target.value
                    )
            );


        $("globalSearch")
            ?.addEventListener(
                "focus",
                event =>
                    buildSearchResults(
                        event.target.value
                    )
            );


        $("searchButton")
            ?.addEventListener(
                "click",
                () =>
                    buildSearchResults(
                        $("globalSearch")?.value ||
                        ""
                    )
            );


        /*
         * Global delegated clicks
         */

        document.addEventListener(
            "click",
            event => {

                const target =
                    event.target;


                /*
                 * Delete product
                 */

                const deleteButton =
                    target.closest(
                        "[data-delete-product]"
                    );


                if (deleteButton) {

                    deleteProduct(
                        deleteButton.dataset
                            .deleteProduct
                    );


                    return;

                }


                /*
                 * Manage order
                 */

                const manageButton =
                    target.closest(
                        "[data-manage-order]"
                    );


                if (manageButton) {

                    openOrderModal(
                        manageButton.dataset
                            .manageOrder
                    );


                    return;

                }


                /*
                 * Search product
                 */

                const searchProduct =
                    target.closest(
                        "[data-search-product]"
                    );


                if (searchProduct) {

                    const id =
                        searchProduct.dataset
                            .searchProduct;


                    $("searchResults")
                        ?.classList.remove(
                            "show"
                        );


                    $("globalSearch")
                        ?.blur();


                    navigateTo(
                        "products"
                    );


                    setTimeout(
                        () => {

                            const product =
                                state.products.find(
                                    item =>
                                        String(
                                            item._id ||
                                            item.id
                                        ) ===
                                        String(id)
                                );


                            if (
                                product &&
                                $("productSearch")
                            ) {

                                $("productSearch").value =
                                    product.name;


                                renderProducts(
                                    [product]
                                );

                            }

                        },
                        100
                    );


                    return;

                }


                /*
                 * Search order
                 */

                const searchOrder =
                    target.closest(
                        "[data-search-order]"
                    );


                if (searchOrder) {

                    $("searchResults")
                        ?.classList.remove(
                            "show"
                        );


                    $("globalSearch")
                        ?.blur();


                    navigateTo(
                        "orders"
                    );


                    setTimeout(
                        () => {

                            const id =
                                searchOrder
                                    .dataset
                                    .searchOrder;


                            const order =
                                state.orders.find(
                                    item =>
                                        String(
                                            getOrderId(
                                                item
                                            )
                                        ) ===
                                        String(id)
                                );


                            if (order) {

                                openOrderModal(
                                    id
                                );

                            }

                        },
                        100
                    );

                    return;

                }


                /*
                 * Close floating panels
                 */

                if (
                    !target.closest(
                        ".profile-wrapper"
                    )
                ) {

                    $("profileDropdown")
                        ?.classList.remove(
                            "show"
                        );

                }


                if (
                    !target.closest(
                        ".notification-wrapper"
                    )
                ) {

                    $("notificationPanel")
                        ?.classList.remove(
                            "show"
                        );

                }


                if (
                    !target.closest(
                        ".sidebar-user"
                    ) &&
                    !target.closest(
                        ".sidebar-user-menu"
                    )
                ) {

                    $("sidebarUserMenu")
                        ?.classList.remove(
                            "show"
                        );

                }


                if (
                    !target.closest(
                        ".global-search"
                    )
                ) {

                    $("searchResults")
                        ?.classList.remove(
                            "show"
                        );

                }

            }
        );


        /*
         * Escape key
         */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeOrderModal();

                    closeFloatingPanels();

                    $("searchResults")
                        ?.classList.remove(
                            "show"
                        );

                }

            }
        );


        /*
         * Modal status tracking fields
         */

        $("modalOrderStatus")
            ?.addEventListener(
                "change",
                event => {

                    const shipped =
                        event.target.value ===
                        "Shipped";


                    const trackingGroup =
                        $("trackingFieldGroup");


                    const trackingUrlGroup =
                        $("trackingUrlGroup");


                    /*
                     * Keep visible for all statuses,
                     * because admin may add tracking
                     * before shipping.
                     */

                    trackingGroup?.classList.toggle(
                        "highlight",
                        shipped
                    );


                    trackingUrlGroup?.classList.toggle(
                        "highlight",
                        shipped
                    );

                }
            );

    }


    /* =========================================================
       INITIALIZE
       ========================================================= */
async function initializeAdmin() {

    if (
        state.loading
    ) {

        return;

    }


    state.loading =
        true;


    try {

        console.log(
            "✓ Checking ZM LABEL Admin Authorization..."
        );


        /* =====================================================
           ADMIN AUTHORIZATION CHECK
        ===================================================== */

        const token =
            localStorage.getItem("adminToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("authToken");


        /*
         * No login token
         */

        if (!token) {

            console.warn(
                "ADMIN ACCESS DENIED: No authentication token."
            );


            window.location.href =
                "login.html";


            return;

        }


        /* =====================================================
           VERIFY TOKEN + USER FROM BACKEND
        ===================================================== */

        const response =
            await fetch(
                buildApiUrl("auth/me"),
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        Accept:
                            "application/json"
                    }
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        }
        catch {

            data = null;

        }


        /*
         * Invalid / expired token
         */

        if (!response.ok) {

            console.warn(
                "ADMIN ACCESS DENIED:",
                response.status,
                data
            );


            localStorage.removeItem(
                "adminToken"
            );

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "authToken"
            );


            window.location.href =
                "login.html";


            return;

        }


        const user =
            data?.user ||
            data?.data?.user ||
            data?.data ||
            null;


        console.log(
            "ADMIN AUTH USER:",
            user
        );


     /* =========================================================
   AUTHENTICATION VERIFIED
   Now safely reveal admin panel
========================================================= */

if (!user) {

    console.warn(
        "ADMIN ACCESS DENIED: User data missing."
    );

    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");

    window.location.replace("login.html");

    return;
}


/*
 * Authentication is valid.
 * Reveal admin UI only now.
 */

document.body.classList.remove(
    "admin-auth-checking"
);


        /* =====================================================
           ADMIN ROLE CHECK
        ===================================================== */

        const role =
            String(
                user?.role || ""
            )
            .trim()
            .toLowerCase();


        if (
            role !== "admin"
        ) {

            console.warn(
                "ADMIN ACCESS DENIED: User is not admin."
            );


            /*
             * Remove token so the customer
             * cannot keep using it for admin page.
             */

            localStorage.removeItem(
                "adminToken"
            );


            /*
             * Do NOT necessarily remove normal
             * customer token if your website uses
             * the same login session.
             */


            /*
             * Redirect normal customer
             * away from admin panel.
             */

            window.location.href =
                "index.html";


            return;

        }


        /* =====================================================
           ADMIN AUTHORIZED
        ===================================================== */

        console.log(
            "✓ ADMIN AUTHORIZED:",
            user.email
        );


        /*
         * Store verified admin user
         * for frontend use if needed.
         */

        window.ZM_ADMIN_USER =
            user;


        /* =====================================================
           INITIALIZE ADMIN PANEL
        ===================================================== */

        bindEvents();

        loadSettings();

        updateSubCategories();

        renderImagePreview();


        /*
         * Load main dashboard data.
         */

        await loadDashboard();


        /*
         * Make sure dashboard
         * is visible.
         */

        await navigateTo(
            "dashboard"
        );


        console.log(
            "✓ ZM LABEL Admin ready"
        );

    }
    catch (error) {

        console.error(
            "Admin authorization / initialization error:",
            error
        );


        /*
         * Any authentication-related
         * failure should not leave
         * the admin panel open.
         */

        if (
            error?.message &&
            (
                error.message
                    .toLowerCase()
                    .includes("unauthorized") ||

                error.message
                    .toLowerCase()
                    .includes("not authorized") ||

                error.message
                    .toLowerCase()
                    .includes("token")
            )
        ) {

            localStorage.removeItem(
                "adminToken"
            );

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "authToken"
            );


            window.location.href =
                "login.html";


            return;

        }


        showToast(
            error.message ||
            "Admin initialization failed.",
            "error"
        );

    }
    finally {

        state.loading =
            false;

    }

}


    /* =========================================================
       GLOBAL COMPATIBILITY
       ========================================================= */

    /*
     * These are exposed because
     * other admin code / HTML may
     * call them.
     */

    window.ZMAdmin = {

        state,

        apiRequest,

        apiGet,

        apiPost,

        apiPut,

        apiDelete,

        getImageUrl,

        loadProducts,

        loadOrders,

        loadCustomers,

        loadDashboard,

        loadAnalytics,

        loadHomepageProducts,

        renderHomepageProductData,

        renderProducts,

        renderOrders,

        renderCustomers,

        navigateTo,

        showSection,

        openOrderModal,

        closeOrderModal,

        destroyChart,

        createChart

    };


    window.loadProducts =
        loadProducts;


    window.loadOrders =
        loadOrders;


    window.loadCustomers =
        loadCustomers;


    window.loadDashboard =
        loadDashboard;


    window.loadAnalytics =
        loadAnalytics;


    window.loadHomepageProducts =
        loadHomepageProducts;


    window.renderHomepageProductData =
        renderHomepageProductData;


    window.navigateTo =
        navigateTo;


    window.showSection =
        showSection;


    window.openOrderModal =
        openOrderModal;


    window.closeOrderModal =
        closeOrderModal;


    /* =========================================================
       DOM READY
       ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeAdmin,
            {
                once: true
            }
        );

    }
    else {

        initializeAdmin();

    }


})();
/* =========================================================
   ZM LABEL
   COUPON MANAGEMENT
   CREATE / EDIT / DELETE / FILTER / SEARCH
========================================================= */

(function initCouponManagement() {

    "use strict";

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const createCouponBtn = document.getElementById("createCouponBtn");

    const couponModal = document.getElementById("couponModal");
    const couponModalOverlay = document.getElementById("couponModalOverlay");

    const closeCouponModal = document.getElementById("closeCouponModal");
    const cancelCouponBtn = document.getElementById("cancelCouponBtn");

    const saveCouponBtn = document.getElementById("saveCouponBtn");

    const couponCode = document.getElementById("couponCode");
    const couponDiscount = document.getElementById("couponDiscount");
    const couponMinimumOrder = document.getElementById("couponMinimumOrder");
    const couponExpiry = document.getElementById("couponExpiry");
    const couponUsageLimit = document.getElementById("couponUsageLimit");
    const couponPerCustomer = document.getElementById("couponPerCustomer");
    const couponActive = document.getElementById("couponActive");

    const generateCouponCode =
        document.getElementById("generateCouponCode");

    const couponPreviewCode =
        document.getElementById("couponPreviewCode");

    const couponPreviewDiscount =
        document.getElementById("couponPreviewDiscount");

    const couponsTableBody =
        document.getElementById("couponsTableBody");

    const couponSearch =
        document.getElementById("couponSearch");

    const couponStatusFilter =
        document.getElementById("couponStatusFilter");


    /* =====================================================
       INTERNAL STATE
    ===================================================== */

    let coupons = [];

    let editingCouponId = null;


    /* =====================================================
       STORAGE
       -----------------------------------------------------
       This makes the coupon section work immediately even
       if backend coupon routes haven't been created yet.
    ===================================================== */

    const COUPON_STORAGE_KEY = "zm_label_coupons";


    function loadCouponsFromStorage() {

        try {

            const saved =
                localStorage.getItem(COUPON_STORAGE_KEY);

            if (!saved) {

                coupons = [];

                return;
            }

            const parsed = JSON.parse(saved);

            coupons = Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            console.error(
                "Coupon storage load error:",
                error
            );

            coupons = [];
        }
    }


    function saveCouponsToStorage() {

        try {

            localStorage.setItem(
                COUPON_STORAGE_KEY,
                JSON.stringify(coupons)
            );

        } catch (error) {

            console.error(
                "Coupon storage save error:",
                error
            );

        }

    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showCouponToast(message, type = "success") {

        const toast =
            document.getElementById("toast");

        const toastMessage =
            document.getElementById("toastMessage");

        if (!toast || !toastMessage) {

            alert(message);

            return;
        }

        toastMessage.textContent = message;

        toast.classList.remove(
            "success",
            "error",
            "show"
        );

        toast.classList.add(
            type === "error"
                ? "error"
                : "success"
        );

        requestAnimationFrame(() => {

            toast.classList.add("show");

        });

        clearTimeout(
            window.__zmCouponToastTimer
        );

        window.__zmCouponToastTimer =
            setTimeout(() => {

                toast.classList.remove("show");

            }, 3000);

    }


    /* =====================================================
       OPEN MODAL
    ===================================================== */

    function openCouponModal(coupon = null) {

        if (!couponModal) {

            console.error(
                "Coupon modal not found: #couponModal"
            );

            return;
        }


        editingCouponId =
            coupon && coupon.id
                ? coupon.id
                : null;


        /* ---------------------------------------------
           EDIT MODE
        --------------------------------------------- */

        if (coupon) {

            const title =
                document.getElementById(
                    "couponModalTitle"
                );

            if (title) {

                title.textContent =
                    "Edit Coupon";

            }


            if (couponCode)
                couponCode.value =
                    coupon.code || "";


            if (couponDiscount)
                couponDiscount.value =
                    coupon.discount ?? "";


            if (couponMinimumOrder)
                couponMinimumOrder.value =
                    coupon.minimumOrder ?? 0;


            if (couponExpiry)
                couponExpiry.value =
                    coupon.expiry || "";


            if (couponUsageLimit)
                couponUsageLimit.value =
                    coupon.usageLimit ?? 0;


            if (couponPerCustomer)
                couponPerCustomer.value =
                    coupon.perCustomerLimit ?? 0;


            if (couponActive)
                couponActive.checked =
                    coupon.active !== false;


            if (saveCouponBtn) {

                saveCouponBtn.innerHTML =
                    '<i class="ri-save-line"></i> Update Coupon';

            }

        }

        /* ---------------------------------------------
           CREATE MODE
        --------------------------------------------- */

        else {

            resetCouponForm();

            const title =
                document.getElementById(
                    "couponModalTitle"
                );

            if (title) {

                title.textContent =
                    "Create Coupon";

            }

            if (saveCouponBtn) {

                saveCouponBtn.innerHTML =
                    '<i class="ri-coupon-3-line"></i> Save Coupon';

            }

        }


        updateCouponPreview();


        couponModal.classList.add("active");

        couponModal.setAttribute(
            "aria-hidden",
            "false"
        );

        couponModal.removeAttribute("inert");

        document.body.classList.add(
            "modal-open"
        );


        setTimeout(() => {

            if (couponCode) {

                couponCode.focus();

            }

        }, 100);

    }


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    function closeCouponModalFunc() {

        if (!couponModal) return;

        couponModal.classList.remove("active");

        couponModal.setAttribute(
            "aria-hidden",
            "true"
        );

        couponModal.setAttribute(
            "inert",
            ""
        );

        document.body.classList.remove(
            "modal-open"
        );

        editingCouponId = null;

        resetCouponForm();

    }


    /* =====================================================
       RESET FORM
    ===================================================== */

    function resetCouponForm() {

        if (couponCode)
            couponCode.value = "";


        if (couponDiscount)
            couponDiscount.value = "";


        if (couponMinimumOrder)
            couponMinimumOrder.value = "0";


        if (couponExpiry)
            couponExpiry.value = "";


        if (couponUsageLimit)
            couponUsageLimit.value = "0";


        if (couponPerCustomer)
            couponPerCustomer.value = "0";


        if (couponActive)
            couponActive.checked = true;


        updateCouponPreview();

    }


    /* =====================================================
       GENERATE RANDOM CODE
    ===================================================== */

    function generateCode() {

        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        let code = "ZM";

        for (let i = 0; i < 6; i++) {

            code +=
                chars.charAt(
                    Math.floor(
                        Math.random() *
                        chars.length
                    )
                );

        }

        if (couponCode) {

            couponCode.value = code;

        }

        updateCouponPreview();

    }


    /* =====================================================
       PREVIEW
    ===================================================== */

    function updateCouponPreview() {

        const code =
            couponCode?.value.trim()
            || "ZM20";


        const discount =
            couponDiscount?.value
            || "20";


        if (couponPreviewCode) {

            couponPreviewCode.textContent =
                code.toUpperCase();

        }


        if (couponPreviewDiscount) {

            couponPreviewDiscount.textContent =
                `${discount}%`;

        }

    }


    /* =====================================================
       VALIDATE
    ===================================================== */

    function validateCoupon() {

        const code =
            couponCode?.value
                .trim()
                .toUpperCase();


        const discount =
            Number(
                couponDiscount?.value
            );


        const minimumOrder =
            Number(
                couponMinimumOrder?.value || 0
            );


        const usageLimit =
            Number(
                couponUsageLimit?.value || 0
            );


        const perCustomerLimit =
            Number(
                couponPerCustomer?.value || 0
            );


        if (!code) {

            showCouponToast(
                "Please enter a coupon code.",
                "error"
            );

            couponCode?.focus();

            return null;
        }


        if (!/^[A-Z0-9_-]+$/i.test(code)) {

            showCouponToast(
                "Coupon code can contain letters, numbers, - or _ only.",
                "error"
            );

            couponCode?.focus();

            return null;
        }


        if (!discount || discount < 1 || discount > 100) {

            showCouponToast(
                "Discount must be between 1% and 100%.",
                "error"
            );

            couponDiscount?.focus();

            return null;
        }


        if (minimumOrder < 0) {

            showCouponToast(
                "Minimum order cannot be negative.",
                "error"
            );

            return null;
        }


        if (usageLimit < 0) {

            showCouponToast(
                "Usage limit cannot be negative.",
                "error"
            );

            return null;
        }


        if (perCustomerLimit < 0) {

            showCouponToast(
                "Customer limit cannot be negative.",
                "error"
            );

            return null;
        }


        /* Check duplicate code */

        const duplicate =
            coupons.find(coupon =>

                coupon.code === code &&
                coupon.id !== editingCouponId

            );


        if (duplicate) {

            showCouponToast(
                "This coupon code already exists.",
                "error"
            );

            couponCode?.focus();

            return null;
        }


        return {

            code,

            discount,

            minimumOrder,

            expiry:
                couponExpiry?.value || "",

            usageLimit,

            perCustomerLimit,

            active:
                couponActive
                    ? couponActive.checked
                    : true

        };

    }


    /* =====================================================
       SAVE COUPON
    ===================================================== */

    function saveCoupon() {

        const data =
            validateCoupon();


        if (!data) return;


        /* ---------------------------------------------
           EDIT EXISTING
        --------------------------------------------- */

        if (editingCouponId) {

            const index =
                coupons.findIndex(
                    coupon =>
                        coupon.id ===
                        editingCouponId
                );


            if (index !== -1) {

                coupons[index] = {

                    ...coupons[index],

                    ...data,

                    updatedAt:
                        new Date().toISOString()

                };


                saveCouponsToStorage();

                renderCoupons();

                updateCouponStats();

                closeCouponModalFunc();


                showCouponToast(
                    "Coupon updated successfully."
                );

                return;

            }

        }


        /* ---------------------------------------------
           CREATE NEW
        --------------------------------------------- */

        const newCoupon = {

            id:
                "coupon_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(2, 8),

            code:
                data.code,

            discount:
                data.discount,

            minimumOrder:
                data.minimumOrder,

            expiry:
                data.expiry,

            usageLimit:
                data.usageLimit,

            perCustomerLimit:
                data.perCustomerLimit,

            used:
                0,

            active:
                data.active,

            createdAt:
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        coupons.unshift(
            newCoupon
        );


        saveCouponsToStorage();

        renderCoupons();

        updateCouponStats();

        closeCouponModalFunc();


        showCouponToast(
            `Coupon ${newCoupon.code} created successfully.`
        );

    }


    /* =====================================================
       EXPIRY CHECK
    ===================================================== */

    function isExpired(coupon) {

        if (!coupon.expiry) {

            return false;

        }

        const expiry =
            new Date(
                coupon.expiry +
                "T23:59:59"
            );

        return expiry < new Date();

    }


    /* =====================================================
       GET STATUS
    ===================================================== */

    function getCouponStatus(coupon) {

        if (isExpired(coupon)) {

            return "expired";

        }

        if (coupon.active === false) {

            return "inactive";

        }

        return "active";

    }


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatCouponDate(date) {

        if (!date) {

            return "No expiry";

        }

        const d =
            new Date(
                date + "T00:00:00"
            );


        if (Number.isNaN(d.getTime())) {

            return "No expiry";

        }


        return d.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    /* =====================================================
       RENDER TABLE
    ===================================================== */

    function renderCoupons() {

        if (!couponsTableBody) {

            console.error(
                "Coupons table body not found: #couponsTableBody"
            );

            return;

        }


        const search =
            couponSearch?.value
                .trim()
                .toLowerCase()
                || "";


        const filter =
            couponStatusFilter?.value
            || "all";


        let filtered =
            [...coupons];


        /* SEARCH */

        if (search) {

            filtered =
                filtered.filter(coupon =>

                    String(
                        coupon.code || ""
                    )
                        .toLowerCase()
                        .includes(search)

                );

        }


        /* STATUS FILTER */

        if (filter !== "all") {

            filtered =
                filtered.filter(coupon =>

                    getCouponStatus(coupon) ===
                    filter

                );

        }


        /* EMPTY */

        if (!filtered.length) {

            couponsTableBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        style="
                            text-align:center;
                            padding:50px 20px;
                        "
                    >

                        <div
                            style="
                                display:flex;
                                flex-direction:column;
                                align-items:center;
                                gap:10px;
                                color:#888;
                            "
                        >

                            <i
                                class="ri-coupon-3-line"
                                style="
                                    font-size:38px;
                                "
                            ></i>

                            <strong>
                                No coupons found
                            </strong>

                            <span>
                                Create your first coupon.
                            </span>

                        </div>

                    </td>

                </tr>

            `;

            return;

        }


        couponsTableBody.innerHTML =
            filtered.map(coupon => {

                const status =
                    getCouponStatus(coupon);


                const statusLabel =
                    status.charAt(0).toUpperCase() +
                    status.slice(1);


                const used =
                    Number(coupon.used || 0);


                const usageLimit =
                    Number(
                        coupon.usageLimit || 0
                    );


                const usageText =
                    usageLimit > 0
                        ? `${used} / ${usageLimit}`
                        : `${used} / ∞`;


                return `

                    <tr>

                        <td>

                            <div
                                style="
                                    display:flex;
                                    align-items:center;
                                    gap:10px;
                                "
                            >

                                <div
                                    style="
                                        width:38px;
                                        height:38px;
                                        border-radius:10px;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        background:#f4f4f4;
                                        flex-shrink:0;
                                    "
                                >

                                    <i
                                        class="ri-coupon-3-line"
                                        style="font-size:19px;"
                                    ></i>

                                </div>

                                <div>

                                    <strong>
                                        ${escapeCouponHTML(coupon.code)}
                                    </strong>

                                    <small
                                        style="
                                            display:block;
                                            color:#999;
                                            margin-top:3px;
                                        "
                                    >
                                        ${coupon.perCustomerLimit > 0
                                            ? `Max ${coupon.perCustomerLimit} per customer`
                                            : "Unlimited per customer"}
                                    </small>

                                </div>

                            </div>

                        </td>


                        <td>

                            <strong>
                                ${Number(coupon.discount)}%
                            </strong>

                        </td>


                        <td>

                            Rs.
                            ${Number(
                                coupon.minimumOrder || 0
                            ).toLocaleString()}

                        </td>


                        <td>
                            ${usageText}
                        </td>


                        <td>

                            ${formatCouponDate(
                                coupon.expiry
                            )}

                        </td>


                        <td>

                            <span
                                class="status-badge ${status}"
                            >

                                ${statusLabel}

                            </span>

                        </td>


                        <td>

                            <div
                                style="
                                    display:flex;
                                    gap:7px;
                                "
                            >

                                <button
                                    type="button"
                                    class="table-action-button coupon-edit-btn"
                                    data-id="${coupon.id}"
                                    title="Edit Coupon"
                                >

                                    <i class="ri-edit-line"></i>

                                </button>


                                <button
                                    type="button"
                                    class="table-action-button coupon-toggle-btn"
                                    data-id="${coupon.id}"
                                    title="${coupon.active ? "Deactivate" : "Activate"} Coupon"
                                >

                                    <i
                                        class="${
                                            coupon.active
                                                ? "ri-pause-circle-line"
                                                : "ri-play-circle-line"
                                        }"
                                    ></i>

                                </button>


                                <button
                                    type="button"
                                    class="table-action-button coupon-delete-btn"
                                    data-id="${coupon.id}"
                                    title="Delete Coupon"
                                >

                                    <i class="ri-delete-bin-line"></i>

                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }).join("");

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeCouponHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       UPDATE STATS
    ===================================================== */

    function updateCouponStats() {

        const total =
            coupons.length;


        const active =
            coupons.filter(
                coupon =>
                    getCouponStatus(coupon) ===
                    "active"
            ).length;


        const used =
            coupons.reduce(
                (sum, coupon) =>
                    sum +
                    Number(
                        coupon.used || 0
                    ),
                0
            );


        const averageDiscount =
            total
                ? Math.round(
                    coupons.reduce(
                        (sum, coupon) =>
                            sum +
                            Number(
                                coupon.discount || 0
                            ),
                        0
                    ) / total
                )
                : 0;


        const totalCouponsCount =
            document.getElementById(
                "totalCouponsCount"
            );


        const activeCouponsCount =
            document.getElementById(
                "activeCouponsCount"
            );


        const usedCouponsCount =
            document.getElementById(
                "usedCouponsCount"
            );


        const totalCouponDiscount =
            document.getElementById(
                "totalCouponDiscount"
            );


        const couponCount =
            document.getElementById(
                "couponCount"
            );


        if (totalCouponsCount)
            totalCouponsCount.textContent =
                total;


        if (activeCouponsCount)
            activeCouponsCount.textContent =
                active;


        if (usedCouponsCount)
            usedCouponsCount.textContent =
                used;


        if (totalCouponDiscount)
            totalCouponDiscount.textContent =
                `${averageDiscount}%`;


        if (couponCount)
            couponCount.textContent =
                active;

    }


    /* =====================================================
       EDIT
    ===================================================== */

    function editCoupon(id) {

        const coupon =
            coupons.find(
                item => item.id === id
            );


        if (!coupon) {

            showCouponToast(
                "Coupon not found.",
                "error"
            );

            return;

        }


        openCouponModal(coupon);

    }


    /* =====================================================
       TOGGLE
    ===================================================== */

    function toggleCoupon(id) {

        const coupon =
            coupons.find(
                item => item.id === id
            );


        if (!coupon) return;


        if (isExpired(coupon)) {

            showCouponToast(
                "This coupon has expired. Change its expiry date first.",
                "error"
            );

            return;

        }


        coupon.active =
            !coupon.active;


        coupon.updatedAt =
            new Date().toISOString();


        saveCouponsToStorage();

        renderCoupons();

        updateCouponStats();


        showCouponToast(
            coupon.active
                ? `${coupon.code} activated.`
                : `${coupon.code} deactivated.`
        );

    }


    /* =====================================================
       DELETE
    ===================================================== */

    function deleteCoupon(id) {

        const coupon =
            coupons.find(
                item => item.id === id
            );


        if (!coupon) return;


        const confirmed =
            window.confirm(
                `Delete coupon "${coupon.code}"?`
            );


        if (!confirmed) return;


        coupons =
            coupons.filter(
                item => item.id !== id
            );


        saveCouponsToStorage();

        renderCoupons();

        updateCouponStats();


        showCouponToast(
            `${coupon.code} deleted.`
        );

    }


    /* =====================================================
       TABLE ACTIONS
    ===================================================== */

    if (couponsTableBody) {

        couponsTableBody.addEventListener(
            "click",
            function(event) {

                const editButton =
                    event.target.closest(
                        ".coupon-edit-btn"
                    );


                const toggleButton =
                    event.target.closest(
                        ".coupon-toggle-btn"
                    );


                const deleteButton =
                    event.target.closest(
                        ".coupon-delete-btn"
                    );


                if (editButton) {

                    editCoupon(
                        editButton.dataset.id
                    );

                    return;

                }


                if (toggleButton) {

                    toggleCoupon(
                        toggleButton.dataset.id
                    );

                    return;

                }


                if (deleteButton) {

                    deleteCoupon(
                        deleteButton.dataset.id
                    );

                    return;

                }

            }
        );

    }


    /* =====================================================
       CREATE BUTTON
       *** THIS FIXES YOUR MAIN ISSUE ***
    ===================================================== */

    if (createCouponBtn) {

        createCouponBtn.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                console.log(
                    "ZM: Create Coupon clicked"
                );

                openCouponModal();

            }
        );

    } else {

        console.error(
            "ZM ERROR: #createCouponBtn not found"
        );

    }


    /* =====================================================
       SAVE BUTTON
    ===================================================== */

    if (saveCouponBtn) {

        saveCouponBtn.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                console.log(
                    "ZM: Save Coupon clicked"
                );

                saveCoupon();

            }
        );

    }


    /* =====================================================
       CLOSE BUTTONS
    ===================================================== */

    if (closeCouponModal) {

        closeCouponModal.addEventListener(
            "click",
            closeCouponModalFunc
        );

    }


    if (cancelCouponBtn) {

        cancelCouponBtn.addEventListener(
            "click",
            closeCouponModalFunc
        );

    }


    if (couponModalOverlay) {

        couponModalOverlay.addEventListener(
            "click",
            closeCouponModalFunc
        );

    }


    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape" &&
                couponModal &&
                couponModal.classList.contains("active")
            ) {

                closeCouponModalFunc();

            }

        }
    );


    /* =====================================================
       GENERATE CODE
    ===================================================== */

    if (generateCouponCode) {

        generateCouponCode.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                generateCode();

            }
        );

    }


    /* =====================================================
       LIVE PREVIEW
    ===================================================== */

    if (couponCode) {

        couponCode.addEventListener(
            "input",
            updateCouponPreview
        );

        couponCode.addEventListener(
            "blur",
            function() {

                couponCode.value =
                    couponCode.value
                        .trim()
                        .toUpperCase();

                updateCouponPreview();

            }
        );

    }


    if (couponDiscount) {

        couponDiscount.addEventListener(
            "input",
            updateCouponPreview
        );

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    if (couponSearch) {

        couponSearch.addEventListener(
            "input",
            renderCoupons
        );

    }


    /* =====================================================
       FILTER
    ===================================================== */

    if (couponStatusFilter) {

        couponStatusFilter.addEventListener(
            "change",
            renderCoupons
        );

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    loadCouponsFromStorage();

    renderCoupons();

    updateCouponStats();

    console.log(
        "ZM LABEL Coupon Management initialized successfully."
    );


    /* =====================================================
       GLOBAL ACCESS
       Useful if another admin.js function needs coupons.
    ===================================================== */

    window.ZMCouponManager = {

        open: openCouponModal,

        close: closeCouponModalFunc,

        refresh: function() {

            loadCouponsFromStorage();

            renderCoupons();

            updateCouponStats();

        },

        getAll: function() {

            return [...coupons];

        }

    };


})();

/* =========================================================
   ZM LABEL - COUPON MODAL FORCE FIX
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("ZM COUPON FIX LOADED");

    const createBtn = document.getElementById("createCouponBtn");
    const modal = document.getElementById("couponModal");
    const overlay = document.getElementById("couponModalOverlay");
    const closeBtn = document.getElementById("closeCouponModal");
    const cancelBtn = document.getElementById("cancelCouponBtn");

    console.log("Create Button:", createBtn);
    console.log("Coupon Modal:", modal);


    /* =====================================================
       OPEN
    ===================================================== */

    function openCoupon() {

        console.log("OPEN COUPON FIRED");

        if (!modal) {
            console.error("couponModal NOT FOUND");
            return;
        }

        /*
         * Pehle modal ko completely accessible banao
         */

        modal.removeAttribute("inert");

        modal.setAttribute("aria-hidden", "false");

        modal.classList.add("active");

        modal.style.display = "flex";
        modal.style.visibility = "visible";
        modal.style.opacity = "1";
        modal.style.pointerEvents = "auto";

        document.body.style.overflow = "hidden";


        /* =================================================
           RESET CREATE FORM
        ================================================= */

        const title =
            document.getElementById("couponModalTitle");

        if (title) {
            title.textContent = "Create Coupon";
        }


        const code =
            document.getElementById("couponCode");

        const discount =
            document.getElementById("couponDiscount");

        const minimum =
            document.getElementById("couponMinimumOrder");

        const expiry =
            document.getElementById("couponExpiry");

        const usage =
            document.getElementById("couponUsageLimit");

        const customer =
            document.getElementById("couponPerCustomer");

        const active =
            document.getElementById("couponActive");


        if (code) {
            code.value = "";
        }

        if (discount) {
            discount.value = "";
        }

        if (minimum) {
            minimum.value = "0";
        }

        if (expiry) {
            expiry.value = "";
        }

        if (usage) {
            usage.value = "0";
        }

        if (customer) {
            customer.value = "0";
        }

        if (active) {
            active.checked = true;
        }


        /* =================================================
           RESET PREVIEW
        ================================================= */

        const previewCode =
            document.getElementById("couponPreviewCode");

        const previewDiscount =
            document.getElementById("couponPreviewDiscount");


        if (previewCode) {
            previewCode.textContent = "ZM20";
        }

        if (previewDiscount) {
            previewDiscount.textContent = "20%";
        }


        /* =================================================
           FOCUS COUPON CODE
        ================================================= */

        setTimeout(function () {

            if (
                code &&
                modal.classList.contains("active")
            ) {

                code.focus();

            }

        }, 100);

    }


    /* =====================================================
       CLOSE
       FIXED ARIA-HIDDEN / FOCUS ISSUE
    ===================================================== */

    function closeCoupon() {

        if (!modal) return;

        console.log("CLOSE COUPON FIRED");


        /*
         * IMPORTANT:
         *
         * Save / Cancel / Close button par agar focus hai
         * to pehle focus modal se bahar nikalna hai.
         *
         * Ye tumhara:
         *
         * "Blocked aria-hidden..."
         *
         * wala error solve karta hai.
         */

        if (
            document.activeElement &&
            modal.contains(document.activeElement)
        ) {

            document.activeElement.blur();

        }


        /*
         * Focus ko Create Coupon button par wapas bhejo.
         *
         * Lekin sirf agar button available ho.
         */

        if (createBtn) {

            try {
                createBtn.focus();
            } catch (error) {
                console.warn(
                    "Could not restore focus:",
                    error
                );
            }

        }


        /*
         * Ab modal ko hidden karo.
         */

        modal.classList.remove("active");

        /*
         * IMPORTANT:
         * display:none directly set kar rahe hain.
         * Isse modal screen par stuck nahi rahega.
         */

        modal.style.display = "none";
        modal.style.visibility = "hidden";
        modal.style.opacity = "0";
        modal.style.pointerEvents = "none";


        /*
         * Ab aria-hidden safe hai kyun ke focus
         * modal ke andar nahi raha.
         */

        modal.setAttribute("aria-hidden", "true");

        modal.setAttribute("inert", "");


        /*
         * Body scroll restore
         */

        document.body.style.overflow = "";


        console.log("COUPON MODAL CLOSED");

    }


    /* =====================================================
       CREATE BUTTON
    ===================================================== */

    if (createBtn) {

        createBtn.onclick = function (e) {

            e.preventDefault();
            e.stopPropagation();

            console.log(
                "CREATE COUPON BUTTON CLICKED"
            );

            openCoupon();

        };

    } else {

        console.error(
            "❌ createCouponBtn not found"
        );

    }


    /* =====================================================
       CLOSE BUTTON
    ===================================================== */

    if (closeBtn) {

        closeBtn.onclick = function (e) {

            e.preventDefault();
            e.stopPropagation();

            closeCoupon();

        };

    }


    /* =====================================================
       CANCEL BUTTON
    ===================================================== */

    if (cancelBtn) {

        cancelBtn.onclick = function (e) {

            e.preventDefault();
            e.stopPropagation();

            closeCoupon();

        };

    }


    /* =====================================================
       OVERLAY
    ===================================================== */

    if (overlay) {

        overlay.onclick = function (e) {

            e.preventDefault();

            closeCoupon();

        };

    }


    /* =====================================================
       ESC
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (e) {

            if (
                e.key === "Escape" &&
                modal &&
                modal.classList.contains("active")
            ) {

                e.preventDefault();

                closeCoupon();

            }

        }
    );


    /* =====================================================
       EXTRA SAFETY
       Prevent focus from staying inside hidden modal
    ===================================================== */

    if (modal) {

        modal.addEventListener(
            "transitionend",
            function () {

                if (
                    modal.getAttribute("aria-hidden") === "true" &&
                    modal.contains(document.activeElement)
                ) {

                    document.activeElement.blur();

                    if (createBtn) {
                        createBtn.focus();
                    }

                }

            }
        );

    }

});
/* =========================================================
   ZM LABEL — FINAL COUPON FOCUS / CLOSE FIX
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("couponModal");
    const saveBtn = document.getElementById("saveCouponBtn");
    const createBtn = document.getElementById("createCouponBtn");

    if (!modal) return;


    function forceSafeCouponClose() {

        /* Remove focus from Save button/modal */
        if (
            document.activeElement &&
            modal.contains(document.activeElement)
        ) {
            document.activeElement.blur();
        }


        /* Move focus outside modal */
        if (createBtn) {
            createBtn.focus();
        }


        /* Hide modal */
        modal.classList.remove("active");

        modal.style.display = "none";
        modal.style.visibility = "hidden";
        modal.style.opacity = "0";
        modal.style.pointerEvents = "none";


        /* Accessibility */
        modal.setAttribute("aria-hidden", "true");
        modal.setAttribute("inert", "");


        /* Restore scrolling */
        document.body.style.overflow = "";

    }


    /*
     * Watch for aria-hidden changes.
     *
     * Agar existing save code modal ko aria-hidden=true
     * karta hai jab Save button par focus ho, hum focus
     * ko immediately bahar move kar denge.
     */

    const observer = new MutationObserver(function (mutations) {

        mutations.forEach(function (mutation) {

            if (
                mutation.attributeName === "aria-hidden" &&
                modal.getAttribute("aria-hidden") === "true"
            ) {

                if (modal.contains(document.activeElement)) {

                    forceSafeCouponClose();

                }

            }

        });

    });


    observer.observe(modal, {
        attributes: true
    });


    /*
     * Extra safety for Save button
     */

    if (saveBtn) {

        saveBtn.addEventListener(
            "click",
            function () {

                setTimeout(function () {

                    if (
                        modal.getAttribute("aria-hidden") === "true"
                    ) {

                        forceSafeCouponClose();

                    }

                }, 50);

            },
            true
        );

    }

});