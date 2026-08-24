const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    // Basic

    name: {
        type: String,
        required: true
    },

    brand: {
        type: String,
        default: ""
    },

    category: {
        type: String,
        required: true
    },

    subCategory: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },


    // Price

    price: {
        type: Number,
        required: true
    },

    discount: {
        type: Number,
        default: 0
    },


    // Inventory

    stock: {
        type: Number,
        default: 0
    },


    // =====================================================
    // IMAGES
    // =====================================================

    image: {
        type: String,
        required: true
    },

    images: [{
        type: String
    }],


    // Variants

    colors: [{
        type: String
    }],

    sizes: [{
        type: String
    }],


    // Labels

    badge: {
        type: String,
        enum: ["", "NEW", "HOT", "SALE", "Premium"],
        default: ""
    },


    // Homepage

    featured: {
        type: Boolean,
        default: false
    },

    showOnHome: {
        type: Boolean,
        default: false
    },


    // Product Status

    status: {
        type: String,
        enum: ["Active", "Draft"],
        default: "Active"
    }

}, {
    timestamps: true
});


module.exports =
    mongoose.models.Product ||
    mongoose.model("Product", productSchema);