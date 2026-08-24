/* =========================================================
   ZM LABEL — PRODUCT REVIEWS
   REVIEWS.JS

   Backend:
   GET    /api/reviews/product/:productId
   POST   /api/reviews
   DELETE /api/reviews/:id

   No backend changes required.
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       API
    ===================================================== */
const API_ROOT =
    window.ZM_API_BASE ||
    "http://localhost:5000/api";


    const REVIEWS_API =
        `${API_ROOT}/reviews`;


    /* =====================================================
       STATE
    ===================================================== */

    let productId = null;

    let allReviews = [];

    let currentSort = "newest";

    let showAllReviews = false;

    let selectedRating = 0;


    /* =====================================================
       DOM
    ===================================================== */

    const reviewsSection =
        document.getElementById(
            "productReviews"
        );


    const reviewsList =
        document.getElementById(
            "reviewsList"
        );


    const reviewsEmpty =
        document.getElementById(
            "reviewsEmpty"
        );


    const reviewFormWrapper =
        document.getElementById(
            "reviewFormWrapper"
        );


    const reviewForm =
        document.getElementById(
            "reviewForm"
        );


    const writeReviewBtn =
        document.getElementById(
            "writeReviewBtn"
        );


    const closeReviewForm =
        document.getElementById(
            "closeReviewForm"
        );


    const writeFirstReviewBtn =
        document.getElementById(
            "writeFirstReviewBtn"
        );


    const reviewSort =
        document.getElementById(
            "reviewSort"
        );


    const reviewRating =
        document.getElementById(
            "reviewRating"
        );


    const reviewComment =
        document.getElementById(
            "reviewComment"
        );


    const reviewName =
        document.getElementById(
            "reviewName"
        );


    const reviewImages =
        document.getElementById(
            "reviewImages"
        );


    const reviewCharCount =
        document.getElementById(
            "reviewCharCount"
        );


    const submitReviewBtn =
        document.getElementById(
            "submitReviewBtn"
        );


    const averageRating =
        document.getElementById(
            "averageRating"
        );


    const averageStars =
        document.getElementById(
            "averageStars"
        );


    const reviewCount =
        document.getElementById(
            "reviewCount"
        );


    const reviewsCountLabel =
        document.getElementById(
            "reviewsCountLabel"
        );


    /* =====================================================
       GET PRODUCT ID
    ===================================================== */

    function getProductId() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        return (

            params.get("id") ||

            params.get("productId") ||

            params.get("product")

        );

    }


    /* =====================================================
       TOKEN
       Supports common auth storage names.
    ===================================================== */

    function getAuthToken() {

        const possibleKeys = [

            "token",

            "authToken",

            "accessToken",

            "jwt",

            "zmToken",

            "userToken"

        ];


        for (
            const key of possibleKeys
        ) {

            const value =
                localStorage.getItem(
                    key
                );


            if (value) {

                return value;

            }

        }


        return null;

    }


    /* =====================================================
       AUTH HEADERS
    ===================================================== */

    function getAuthHeaders() {

        const token =
            getAuthToken();


        if (!token) {

            return {};

        }


        return {

            Authorization:
                `Bearer ${token}`

        };

    }


    /* =====================================================
       IMAGE URL
    ===================================================== */
function getImageUrl(imagePath) {

    if (!imagePath) {
        return "";
    }

    // Already complete URL
    if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")
    ) {
        return imagePath;
    }

    // Backend URL
    const backendBase = (
        window.ZM_API_BASE ||
        "http://localhost:5000/api"
    ).replace(/\/api\/?$/, "");

    // /uploads/reviews/filename.jpg
    if (imagePath.startsWith("/")) {
        return backendBase + imagePath;
    }

    return backendBase + "/" + imagePath;
}
    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(value)
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


    /* =====================================================
       DATE
    ===================================================== */

    function formatDate(
        date
    ) {

        if (!date) {

            return "";

        }


        const parsed =
            new Date(date);


        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {

            return "";

        }


        return parsed.toLocaleDateString(
            "en-PK",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    }


    /* =====================================================
       STARS
    ===================================================== */

    function createStars(
        rating
    ) {

        const numericRating =
            Number(rating) || 0;


        let html = "";


        for (
            let i = 1;
            i <= 5;
            i++
        ) {

            html +=
                i <= numericRating

                    ? `<i class="ri-star-fill"></i>`

                    : `<i class="ri-star-line"></i>`;

        }


        return html;

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function initReviews() {

        if (!reviewsSection) {

            return;

        }


        productId =
            getProductId();


        if (!productId) {

            console.warn(
                "ZM Reviews: Product ID not found."
            );

            hideReviewsSection();

            return;

        }


        createViewReviewsButton();

        createViewAllButton();

        setupEvents();

        await loadReviews();

    }


    /* =====================================================
       HIDE SECTION IF NO PRODUCT
    ===================================================== */

    function hideReviewsSection() {

        if (reviewsSection) {

            reviewsSection.style.display =
                "none";

        }

    }


    /* =====================================================
       CREATE VIEW REVIEWS BUTTON
    ===================================================== */

    function createViewReviewsButton() {

        if (
            document.getElementById(
                "openReviewsBtn"
            )
        ) {

            return;

        }


        const header =
            reviewsSection.querySelector(
                ".reviews-header"
            );


        if (!header) {

            return;

        }


        const button =
            document.createElement(
                "button"
            );


        button.type = "button";

        button.id =
            "openReviewsBtn";

        button.className =
            "open-reviews-btn";


        button.innerHTML = `

            <span>
                View Reviews
            </span>

            <i class="ri-arrow-down-line"></i>

        `;


        button.addEventListener(
            "click",
            function () {

                const action =
                    document.querySelector(
                        ".review-action"
                    );


                if (action) {

                    action.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }


                showReviewContent();

            }
        );


        header.appendChild(
            button
        );

    }


    /* =====================================================
       CREATE VIEW ALL BUTTON
    ===================================================== */

    function createViewAllButton() {

        if (
            document.getElementById(
                "viewAllReviewsBtn"
            )
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


        button.type = "button";

        button.id =
            "viewAllReviewsBtn";

        button.className =
            "view-all-reviews-btn";


        button.innerHTML = `

            <span>
                View All Reviews
            </span>

            <i class="ri-arrow-down-line"></i>

        `;


        button.style.display =
            "none";


        button.addEventListener(
            "click",
            function () {

                showAllReviews =
                    !showAllReviews;


                renderReviews();


                button.innerHTML =
                    showAllReviews

                        ? `
                            <span>
                                Show Less
                            </span>

                            <i class="ri-arrow-up-line"></i>
                          `

                        : `
                            <span>
                                View All Reviews
                            </span>

                            <i class="ri-arrow-down-line"></i>
                          `;

            }
        );


        reviewsList.after(
            button
        );

    }


    /* =====================================================
       SHOW REVIEW CONTENT
    ===================================================== */

    function showReviewContent() {

        const toolbar =
            document.querySelector(
                ".reviews-toolbar"
            );


        if (toolbar) {

            toolbar.style.display =
                "flex";

        }


        if (reviewsList) {

            reviewsList.style.display =
                "block";

        }


        const button =
            document.getElementById(
                "openReviewsBtn"
            );


        if (button) {

            button.style.display =
                "none";

        }

    }


    /* =====================================================
       LOAD REVIEWS
    ===================================================== */

    async function loadReviews() {

        try {

            showLoading();


            const response =
                await fetch(

                    `${REVIEWS_API}/product/${productId}`,

                    {
                        method: "GET",

                        headers: {

                            Accept:
                                "application/json"

                        }

                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(

                    data.message ||
                    "Unable to load reviews"

                );

            }


            if (
                !data.success
            ) {

                throw new Error(

                    data.message ||
                    "Unable to load reviews"

                );

            }


            allReviews =
                Array.isArray(
                    data.reviews
                )

                    ? data.reviews

                    : [];


            updateRatingSummary(
                data
            );


            renderReviews();


        }

        catch (error) {

            console.error(
                "REVIEWS LOAD ERROR:",
                error
            );


            showReviewError();

        }

    }


    /* =====================================================
       RATING SUMMARY
    ===================================================== */

    function updateRatingSummary(
        data
    ) {

        const average =
            Number(
                data.averageRating || 0
            );


        const count =
            Number(
                data.reviewCount || 0
            );


        if (averageRating) {

            averageRating.textContent =
                average.toFixed(1);

        }


        if (averageStars) {

            averageStars.innerHTML =
                createStars(
                    Math.round(
                        average
                    )
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
            data.ratingBreakdown || {};


        updateRatingBar(
            5,
            breakdown[5] || 0,
            count
        );


        updateRatingBar(
            4,
            breakdown[4] || 0,
            count
        );


        updateRatingBar(
            3,
            breakdown[3] || 0,
            count
        );


        updateRatingBar(
            2,
            breakdown[2] || 0,
            count
        );


        updateRatingBar(
            1,
            breakdown[1] || 0,
            count
        );

    }


    /* =====================================================
       RATING BAR
    ===================================================== */

    function updateRatingBar(
        rating,
        count,
        total
    ) {

        const bar =
            document.getElementById(
                `rating${rating}Bar`
            );


        const countElement =
            document.getElementById(
                `rating${rating}Count`
            );


        const percentage =
            total > 0

                ? (
                    count /
                    total
                ) * 100

                : 0;


        if (bar) {

            bar.style.width =
                `${percentage}%`;

        }


        if (countElement) {

            countElement.textContent =
                count;

        }

    }


    /* =====================================================
       LOADING
    ===================================================== */

    function showLoading() {

        if (!reviewsList) {

            return;

        }


        reviewsList.innerHTML = `

            <div class="reviews-loading">

                <span class="review-loader"></span>

                <span>
                    Loading reviews...
                </span>

            </div>

        `;

    }


    /* =====================================================
       ERROR
    ===================================================== */

    function showReviewError() {

        if (!reviewsList) {

            return;

        }


        reviewsList.innerHTML = `

            <div class="reviews-empty">

                <i class="ri-error-warning-line"></i>

                <h3>
                    Unable to Load Reviews
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;

    }


    /* =====================================================
       SORT REVIEWS
    ===================================================== */

    function getSortedReviews() {

        const reviews =
            [...allReviews];


        if (
            currentSort ===
            "highest"
        ) {

            return reviews.sort(

                (a, b) =>

                    Number(b.rating || 0) -
                    Number(a.rating || 0)

            );

        }


        if (
            currentSort ===
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


    /* =====================================================
       RENDER REVIEWS
    ===================================================== */

    function renderReviews() {

        if (!reviewsList) {

            return;

        }


        if (
            allReviews.length === 0
        ) {

            reviewsList.innerHTML =
                "";


            if (reviewsEmpty) {

                reviewsEmpty.hidden =
                    false;

            }


            const viewAll =
                document.getElementById(
                    "viewAllReviewsBtn"
                );


            if (viewAll) {

                viewAll.style.display =
                    "none";

            }


            return;

        }


        if (reviewsEmpty) {

            reviewsEmpty.hidden =
                true;

        }


        const sortedReviews =
            getSortedReviews();


        const visibleReviews =
            showAllReviews

                ? sortedReviews

                : sortedReviews.slice(
                    0,
                    1
                );


        reviewsList.innerHTML =
            visibleReviews
                .map(
                    renderSingleReview
                )
                .join("");


        const viewAll =
            document.getElementById(
                "viewAllReviewsBtn"
            );


        if (viewAll) {

            if (
                allReviews.length > 1
            ) {

                viewAll.style.display =
                    "flex";

            }

            else {

                viewAll.style.display =
                    "none";

            }

        }


        attachDeleteButtons();

    }


    /* =====================================================
       RENDER SINGLE REVIEW
    ===================================================== */

    function renderSingleReview(
        review
    ) {

        const name =
            review.name ||
            (
                review.user &&
                review.user.name
            ) ||
            "Customer";


        const rating =
            Number(
                review.rating || 0
            );


        const comment =
            review.comment ||
            "";


        const date =
            formatDate(
                review.createdAt
            );


        const firstLetter =
            escapeHTML(
                name
                    .trim()
                    .charAt(0)
                    .toUpperCase()
            );


        let imagesHTML =
            "";


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
                            image => `

                                <img
                                    src="${escapeHTML(
                                        getImageUrl(image)
                                    )}"
                                    alt="Customer review image"
                                    loading="lazy"
                                    onerror="
                                        this.style.display='none';
                                    "
                                >

                            `
                        )
                        .join("")}

                </div>

            `;

        }


        return `

            <article
                class="review-item"
                data-review-id="${escapeHTML(
                    review._id || review.id || ""
                )}">

                <div class="review-item-header">

                    <div class="review-user">

                        <div class="review-avatar">

                            ${firstLetter}

                        </div>


                        <div class="review-user-info">

                            <h4>
                                ${escapeHTML(name)}
                            </h4>

                            <span>
                                ${date}
                            </span>

                        </div>

                    </div>


                    <div
                        class="review-item-rating"
                        aria-label="${rating} out of 5 stars">

                        ${createStars(rating)}

                    </div>

                </div>


                <p class="review-item-comment">

                    ${escapeHTML(comment)}

                </p>


                ${imagesHTML}


                ${getDeleteButton(review)}

            </article>

        `;

    }


    /* =====================================================
       DELETE BUTTON
       Show only if review belongs to logged-in user.

       Because GET response gives user object, compare
       against common localStorage user IDs.
    ===================================================== */

    function getDeleteButton(
        review
    ) {

        const currentUserId =
            getCurrentUserId();


        const reviewUserId =
            review.user &&
            (
                review.user._id ||
                review.user.id ||
                review.user
            );


        if (
            !currentUserId ||
            !reviewUserId
        ) {

            return "";

        }


        if (
            String(
                currentUserId
            ) !==
            String(
                reviewUserId
            )
        ) {

            return "";

        }


        return `

            <button
                type="button"
                class="delete-review-btn"
                data-review-id="${escapeHTML(
                    review._id || review.id || ""
                )}">

                Delete Review

            </button>

        `;

    }


    /* =====================================================
       CURRENT USER ID
    ===================================================== */

    function getCurrentUserId() {

        const possibleKeys = [

            "user",

            "currentUser",

            "zmUser",

            "userData",

            "authUser"

        ];


        for (
            const key of possibleKeys
        ) {

            try {

                const stored =
                    localStorage.getItem(
                        key
                    );


                if (!stored) {

                    continue;

                }


                const parsed =
                    JSON.parse(
                        stored
                    );


                if (
                    parsed &&
                    (
                        parsed._id ||
                        parsed.id ||
                        (
                            parsed.user &&
                            (
                                parsed.user._id ||
                                parsed.user.id
                            )
                        )
                    )
                ) {

                    return (

                        parsed._id ||

                        parsed.id ||

                        parsed.user._id ||

                        parsed.user.id

                    );

                }

            }

            catch {

                continue;

            }

        }


        return null;

    }


    /* =====================================================
       DELETE BUTTON EVENTS
    ===================================================== */

    function attachDeleteButtons() {

        const buttons =
            document.querySelectorAll(
                ".delete-review-btn"
            );


        buttons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            button.dataset.reviewId;


                        if (id) {

                            deleteReview(id);

                        }

                    }
                );

            }
        );

    }


    /* =====================================================
       DELETE REVIEW
    ===================================================== */

    async function deleteReview(
        reviewId
    ) {

        const token =
            getAuthToken();


        if (!token) {

            showMessage(
                "Please login first.",
                "warning"
            );

            return;

        }


        const confirmed =
            window.confirm(
                "Are you sure you want to delete this review?"
            );


        if (!confirmed) {

            return;

        }


        try {

            const response =
                await fetch(

                    `${REVIEWS_API}/${reviewId}`,

                    {
                        method: "DELETE",

                        headers: {

                            ...getAuthHeaders(),

                            Accept:
                                "application/json"

                        }

                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(

                    data.message ||
                    "Unable to delete review"

                );

            }


            showMessage(
                data.message ||
                "Review deleted successfully.",
                "success"
            );


            showAllReviews =
                false;


            await loadReviews();

        }

        catch (error) {

            console.error(
                "DELETE REVIEW ERROR:",
                error
            );


            showMessage(
                error.message ||
                "Unable to delete review.",
                "error"
            );

        }

    }


    /* =====================================================
       OPEN REVIEW FORM
    ===================================================== */

    function openReviewForm() {

        const token =
            getAuthToken();


        if (!token) {

            showMessage(
                "Please login to write a review.",
                "warning"
            );

            return;

        }


        if (!reviewFormWrapper) {

            return;

        }


        reviewFormWrapper.hidden =
            false;


        reviewFormWrapper.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }


    /* =====================================================
       CLOSE REVIEW FORM
    ===================================================== */

    function closeReviewFormHandler() {

        if (!reviewFormWrapper) {

            return;

        }


        reviewFormWrapper.hidden =
            true;

    }


    /* =====================================================
       STAR SELECTOR
    ===================================================== */

    function setupStarSelector() {

        const stars =
            document.querySelectorAll(
                ".review-star"
            );


        stars.forEach(
            star => {

                star.addEventListener(
                    "mouseenter",
                    function () {

                        const rating =
                            Number(
                                star.dataset.rating
                            );


                        highlightStars(
                            rating
                        );

                    }
                );


                star.addEventListener(
                    "click",
                    function () {

                        selectedRating =
                            Number(
                                star.dataset.rating
                            );


                        if (reviewRating) {

                            reviewRating.value =
                                selectedRating;

                        }


                        highlightStars(
                            selectedRating
                        );

                    }
                );

            }
        );


        const selector =
            document.getElementById(
                "reviewStarSelector"
            );


        if (selector) {

            selector.addEventListener(
                "mouseleave",
                function () {

                    highlightStars(
                        selectedRating
                    );

                }
            );

        }

    }


    /* =====================================================
       HIGHLIGHT STARS
    ===================================================== */

    function highlightStars(
        rating
    ) {

        const stars =
            document.querySelectorAll(
                ".review-star"
            );


        stars.forEach(
            star => {

                const value =
                    Number(
                        star.dataset.rating
                    );


                star.classList.toggle(
                    "active",
                    value <= rating
                );

            }
        );

    }


    /* =====================================================
       CHARACTER COUNT
    ===================================================== */

    function setupCharacterCount() {

        if (
            !reviewComment ||
            !reviewCharCount
        ) {

            return;

        }


        reviewComment.addEventListener(
            "input",
            function () {

                reviewCharCount.textContent =
                    reviewComment.value.length;

            }
        );

    }


    /* =====================================================
       SUBMIT REVIEW
    ===================================================== */

    async function submitReview(
        event
    ) {

        event.preventDefault();


        const token =
            getAuthToken();


        if (!token) {

            showMessage(
                "Please login to write a review.",
                "warning"
            );

            return;

        }


        const rating =
            Number(
                reviewRating
                    ? reviewRating.value
                    : 0
            );


        const comment =
            reviewComment
                ? reviewComment.value.trim()
                : "";


        if (
            !rating ||
            rating < 1 ||
            rating > 5
        ) {

            showMessage(
                "Please select a rating.",
                "warning"
            );

            return;

        }


        if (
            comment.length < 3
        ) {

            showMessage(
                "Please write a proper review.",
                "warning"
            );

            return;

        }


        /* ===============================================
           IMAGE VALIDATION
        =============================================== */

        const files =
            reviewImages &&
            reviewImages.files

                ? Array.from(
                    reviewImages.files
                )

                : [];


        if (
            files.length > 5
        ) {

            showMessage(
                "You can upload maximum 5 images.",
                "warning"
            );

            return;

        }


        const allowedTypes = [

            "image/jpeg",

            "image/png",

            "image/webp"

        ];


        for (
            const file of files
        ) {

            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                showMessage(
                    "Only JPG, PNG and WEBP images are allowed.",
                    "warning"
                );

                return;

            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                showMessage(
                    "Each image must be 5MB or smaller.",
                    "warning"
                );

                return;

            }

        }


        /* ===============================================
           FORM DATA
        =============================================== */

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
            reviewName &&
            reviewName.value.trim()
        ) {

            formData.append(
                "name",
                reviewName.value.trim()
            );

        }


        files
            .slice(0, 5)
            .forEach(
                file => {

                    formData.append(
                        "images",
                        file
                    );

                }
            );


        /* ===============================================
           BUTTON STATE
        =============================================== */

        const originalButtonHTML =
            submitReviewBtn
                ? submitReviewBtn.innerHTML
                : "";


        if (submitReviewBtn) {

            submitReviewBtn.disabled =
                true;


            submitReviewBtn.innerHTML = `

                <span class="review-loader"></span>

                Submitting...

            `;

        }


        try {

            const response =
                await fetch(

                    REVIEWS_API,

                    {
                        method: "POST",

                        headers: {

                            ...getAuthHeaders()

                        },

                        body:
                            formData

                    }

                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(

                    data.message ||
                    "Unable to submit review"

                );

            }


            if (
                !data.success
            ) {

                throw new Error(

                    data.message ||
                    "Unable to submit review"

                );

            }


            showMessage(
                data.message ||
                "Review submitted successfully.",
                "success"
            );


            resetReviewForm();


            if (reviewFormWrapper) {

                reviewFormWrapper.hidden =
                    true;

            }


            showAllReviews =
                false;


            await loadReviews();


            showReviewContent();

        }

        catch (error) {

            console.error(
                "SUBMIT REVIEW ERROR:",
                error
            );


            showMessage(
                error.message ||
                "Unable to submit review.",
                "error"
            );

        }

        finally {

            if (submitReviewBtn) {

                submitReviewBtn.disabled =
                    false;


                submitReviewBtn.innerHTML =
                    originalButtonHTML;

            }

        }

    }


    /* =====================================================
       RESET FORM
    ===================================================== */

    function resetReviewForm() {

        if (reviewForm) {

            reviewForm.reset();

        }


        selectedRating =
            0;


        if (reviewRating) {

            reviewRating.value =
                "";

        }


        highlightStars(0);


        if (reviewCharCount) {

            reviewCharCount.textContent =
                "0";

        }

    }


    /* =====================================================
       EVENTS
    ===================================================== */

    function setupEvents() {

        if (writeReviewBtn) {

            writeReviewBtn.addEventListener(
                "click",
                openReviewForm
            );

        }


        if (writeFirstReviewBtn) {

            writeFirstReviewBtn.addEventListener(
                "click",
                openReviewForm
            );

        }


        if (closeReviewForm) {

            closeReviewForm.addEventListener(
                "click",
                closeReviewFormHandler
            );

        }


        if (reviewForm) {

            reviewForm.addEventListener(
                "submit",
                submitReview
            );

        }


        if (reviewSort) {

            reviewSort.addEventListener(
                "change",
                function () {

                    currentSort =
                        reviewSort.value ||
                        "newest";


                    showAllReviews =
                        false;


                    renderReviews();

                }
            );

        }


        setupStarSelector();

        setupCharacterCount();

    }


    /* =====================================================
       MESSAGE
       Uses SweetAlert2 if available.
       Otherwise falls back to alert.
    ===================================================== */

    function showMessage(
        message,
        type
    ) {

        if (
            window.Swal
        ) {

            let icon =
                "info";


            if (
                type ===
                "success"
            ) {

                icon =
                    "success";

            }

            else if (
                type ===
                "error"
            ) {

                icon =
                    "error";

            }

            else if (
                type ===
                "warning"
            ) {

                icon =
                    "warning";

            }


            Swal.fire({

                icon,

                text:
                    message,

                confirmButtonColor:
                    "#111111",

                confirmButtonText:
                    "OK"

            });


            return;

        }


        window.alert(
            message
        );

    }


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initReviews
        );

    }

    else {

        initReviews();

    }


})();