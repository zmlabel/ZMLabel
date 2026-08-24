const mongoose = require("mongoose");

const Review =
    require("../models/Review");

const Product =
    require("../models/Product");

const User =
    require("../models/User");


// =========================================================
// GET PRODUCT REVIEWS
// GET /api/reviews/product/:productId
// =========================================================

const getProductReviews =
    async (req, res) => {

        try {

            const {
                productId
            } = req.params;


            if (
                !mongoose.Types.ObjectId.isValid(
                    productId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid product ID"

                });

            }


            const product =
                await Product.findById(
                    productId
                );


            if (!product) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found"

                });

            }


            // ==========================================
            // REVIEWS
            // ==========================================

            const reviews =
                await Review.find({

                    product:
                        productId

                })
                .populate(
                    "user",
                    "name"
                )
                .sort({
                    createdAt: -1
                })
                .lean();


            const totalReviews =
                reviews.length;


            // ==========================================
            // AVERAGE
            // ==========================================

            let averageRating = 0;


            if (totalReviews > 0) {

                const totalRating =
                    reviews.reduce(

                        (sum, review) => {

                            return (
                                sum +
                                Number(
                                    review.rating || 0
                                )
                            );

                        },

                        0

                    );


                averageRating =
                    totalRating /
                    totalReviews;

            }


            // ==========================================
            // RATING BREAKDOWN
            // ==========================================

            const ratingBreakdown = {

                5: 0,
                4: 0,
                3: 0,
                2: 0,
                1: 0

            };


            reviews.forEach(review => {

                const rating =
                    Number(
                        review.rating
                    );

                if (
                    rating >= 1 &&
                    rating <= 5
                ) {

                    ratingBreakdown[rating]++;

                }

            });


            return res.status(200).json({

                success: true,

                reviews,

                averageRating:
                    Number(
                        averageRating.toFixed(1)
                    ),

                reviewCount:
                    totalReviews,

                ratingBreakdown

            });

        }

        catch (error) {

            console.error(
                "GET REVIEWS ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to load reviews"

            });

        }

    };


// =========================================================
// CREATE REVIEW
// POST /api/reviews
// =========================================================

const createReview =
    async (req, res) => {

        try {

            // ==========================================
            // AUTH CHECK
            // ==========================================

            if (
                !req.user ||
                !req.user._id
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Please login to write a review"

                });

            }


            const product =
                req.body.product;


            const rating =
                Number(
                    req.body.rating
                );


            const comment =
                String(
                    req.body.comment ||
                    req.body.text ||
                    ""
                ).trim();


            // ==========================================
            // PRODUCT ID
            // ==========================================

            if (!product) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Product ID is required"

                });

            }


            if (
                !mongoose.Types.ObjectId.isValid(
                    product
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid product ID"

                });

            }


            // ==========================================
            // RATING
            // ==========================================

            if (
                !Number.isFinite(rating) ||
                rating < 1 ||
                rating > 5
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Rating must be between 1 and 5"

                });

            }


            // ==========================================
            // COMMENT
            // ==========================================

            if (
                !comment ||
                comment.length < 3
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please write a proper review"

                });

            }


            // ==========================================
            // PRODUCT CHECK
            // ==========================================

            const productExists =
                await Product.findById(
                    product
                );


            if (!productExists) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found"

                });

            }


            // ==========================================
            // USER CHECK
            // ==========================================

            const user =
                await User.findById(
                    req.user._id
                );


            if (!user) {

                return res.status(401).json({

                    success: false,

                    message:
                        "User account not found"

                });

            }


            // ==========================================
            // REVIEW IMAGES
            // ==========================================

            const images = [];


            if (
                Array.isArray(req.files)
            ) {

                req.files
                    .filter(
                        file =>
                            file &&
                            file.filename
                    )
                    .slice(
                        0,
                        5
                    )
                    .forEach(
                        file => {

                            images.push(

                                `/uploads/reviews/${file.filename}`

                            );

                        }
                    );

            }


            // ==========================================
            // NAME
            // ==========================================

            const reviewName =

                req.body.name &&
                String(
                    req.body.name
                ).trim()

                    ?

                    String(
                        req.body.name
                    ).trim()

                    :

                    (
                        user.name ||
                        "Customer"
                    );


            // ==========================================
            // CREATE
            // ==========================================

            const review =
                await Review.create({

                    product,

                    user:
                        req.user._id,

                    name:
                        reviewName,

                    rating,

                    comment,

                    images

                });


            await review.populate(
                "user",
                "name"
            );


            return res.status(201).json({

                success: true,

                message:
                    "Review submitted successfully",

                review

            });

        }

        catch (error) {

            console.error(
                "CREATE REVIEW ERROR:",
                error
            );


            if (
                error.name ===
                "ValidationError"
            ) {

                const messages =
                    Object.values(
                        error.errors || {}
                    ).map(
                        item =>
                            item.message
                    );


                return res.status(400).json({

                    success: false,

                    message:
                        messages.join(", ") ||
                        "Invalid review data"

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Unable to submit review"

            });

        }

    };


// =========================================================
// DELETE REVIEW
// DELETE /api/reviews/:id
// =========================================================

const deleteReview =
    async (req, res) => {

        try {

            if (
                !req.user ||
                !req.user._id
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Please login first"

                });

            }


            const review =
                await Review.findById(
                    req.params.id
                );


            if (!review) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Review not found"

                });

            }


            // ==========================================
            // OWNER CHECK
            // ==========================================

            if (
                review.user.toString() !==
                req.user._id.toString()
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You cannot delete this review"

                });

            }


            await review.deleteOne();


            return res.status(200).json({

                success: true,

                message:
                    "Review deleted successfully"

            });

        }

        catch (error) {

            console.error(
                "DELETE REVIEW ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to delete review"

            });

        }

    };


module.exports = {

    getProductReviews,

    createReview,

    deleteReview

};