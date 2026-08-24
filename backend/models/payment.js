const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null
        },

        paymentType: {
            type: String,
            enum: [
                "Delivery Advance",
                "Order Payment"
            ],
            default: "Delivery Advance"
        },

        paymentMethod: {
            type: String,
            enum: [
                "COD",
                "Easypaisa",
                "JazzCash",
                "Credit Card"
            ],
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        currency: {
            type: String,
            default: "PKR"
        },

        transactionId: {
            type: String,
            default: "",
            trim: true
        },

        gatewayReference: {
            type: String,
            default: "",
            trim: true
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Paid",
                "Failed",
                "Cancelled"
            ],
            default: "Pending"
        },

        gateway: {
            type: String,
            default: "Manual"
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.models.Payment ||
    mongoose.model("Payment", paymentSchema);