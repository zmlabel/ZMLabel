const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const router =
    express.Router();

const {

    getProductReviews,

    createReview,

    deleteReview

} =
    require("../controllers/reviewController");

const {
    protect
} =
    require("../middleware/authMiddleware");


// =========================================================
// REVIEW UPLOAD DIRECTORY
// =========================================================

const uploadDirectory =
    path.join(
        __dirname,
        "../uploads/reviews"
    );


if (
    !fs.existsSync(
        uploadDirectory
    )
) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );

}


// =========================================================
// MULTER STORAGE
// =========================================================

const storage =
    multer.diskStorage({

        destination:
            function (
                req,
                file,
                cb
            ) {

                cb(
                    null,
                    uploadDirectory
                );

            },

        filename:
            function (
                req,
                file,
                cb
            ) {

                const extension =
                    path.extname(
                        file.originalname
                    ).toLowerCase();


                const uniqueName =
                    `review-${Date.now()}-${Math.round(
                        Math.random() * 1000000
                    )}${extension}`;


                cb(
                    null,
                    uniqueName
                );

            }

    });


// =========================================================
// FILE FILTER
// =========================================================

const fileFilter =
    (req, file, cb) => {

        const allowedTypes = [

            "image/jpeg",

            "image/png",

            "image/webp"

        ];


        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            cb(
                null,
                true
            );

        }

        else {

            cb(
                new Error(
                    "Only JPG, PNG and WEBP images are allowed"
                )
            );

        }

    };


// =========================================================
// UPLOAD
// =========================================================

const upload =
    multer({

        storage,

        fileFilter,

        limits: {

            files: 5,

            fileSize:
                5 * 1024 * 1024

        }

    });


// =========================================================
// GET PRODUCT REVIEWS
// =========================================================

router.get(

    "/product/:productId",

    getProductReviews

);


// =========================================================
// CREATE REVIEW
// =========================================================

router.post(

    "/",

    protect,

    upload.array(
        "images",
        5
    ),

    createReview

);


// =========================================================
// DELETE REVIEW
// =========================================================

router.delete(

    "/:id",

    protect,

    deleteReview

);


module.exports =
    router;