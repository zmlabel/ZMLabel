    const mongoose = require("mongoose");

    const reviewSchema =
        new mongoose.Schema(

            {
                // ==========================================
                // PRODUCT
                // ==========================================

                product: {

                    type:
                        mongoose.Schema.Types.ObjectId,

                    ref: "Product",

                    required: true,

                    index: true

                },


                // ==========================================
                // USER
                // ==========================================

                user: {

                    type:
                        mongoose.Schema.Types.ObjectId,

                    ref: "User",

                    required: true,

                    index: true

                },


                // ==========================================
                // DISPLAY NAME
                // ==========================================

                name: {

                    type: String,

                    required: true,

                    trim: true,

                    maxlength: 100

                },


                // ==========================================
                // RATING
                // ==========================================

                rating: {

                    type: Number,

                    required: true,

                    min: 1,

                    max: 5

                },


                // ==========================================
                // REVIEW
                // ==========================================

                comment: {

                    type: String,

                    required: true,

                    trim: true,

                    minlength: 3,

                    maxlength: 3000

                },


                // ==========================================
                // REVIEW IMAGES
                // ==========================================

                images: [

                    {

                        type: String

                    }

                ]

            },

            {

                timestamps: true

            }

        );


    // =========================================================
    // IMPORTANT
    //
    // NO UNIQUE INDEX HERE.
    //
    // Same user CAN post multiple reviews
    // on the same product.
    // =========================================================

    module.exports =
        mongoose.model(
            "Review",
            reviewSchema
        );