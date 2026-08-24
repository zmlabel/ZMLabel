const mongoose = require("mongoose");

// ==========================================================
// ORDER ITEM SCHEMA
// ==========================================================

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },

        price: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        size: {
            type: String,
            default: ""
        },

        color: {
            type: String,
            default: ""
        }
    },
    {
        _id: false
    }
);


// ==========================================================
// ORDER SCHEMA
// ==========================================================

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        products: {
            type: [orderItemSchema],
            required: true,
            default: []
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },

        deliveryCharge: {
            type: Number,
            default: 300
        },

        deliveryChargeStatus: {
            type: String,
            enum: [
                "Pending",
                "Paid"
            ],
            default: "Pending"
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        paymentMethod: {
            type: String,
            enum: [
                "COD",
                "Easypaisa",
                "JazzCash",
                "Credit Card"
            ],
            default: "COD"
        },

        paymentStatus: {
            type: String,
            enum: [
                "Pending",
                "Paid",
                "Failed"
            ],
            default: "Pending"
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Shipped",
                "Delivered",
                "Cancelled"
            ],
            default: "Pending"
        },

        trackingNumber: {
            type: String,
            default: "",
            trim: true
        },

        trackingUrl: {
            type: String,
            default: "",
            trim: true
        }
    },

    {
        timestamps: true
    }
);


// ==========================================================
// EXPORT MODEL
// ==========================================================

module.exports =
    mongoose.models.Order ||
    mongoose.model("Order", orderSchema);