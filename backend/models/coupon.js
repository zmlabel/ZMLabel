const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },

        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true,
            default: "percentage"
        },

        discountValue: {
            type: Number,
            required: true,
            min: 0
        },

        minimumOrder: {
            type: Number,
            default: 0,
            min: 0
        },

        expiryDate: {
            type: Date,
            default: null
        },

        usageLimit: {
            type: Number,
            default: 0
        },

        usedCount: {
            type: Number,
            default: 0
        },

        perCustomerLimit: {
            type: Number,
            default: 0
        },

        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Coupon", couponSchema);