const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            default: "",
            trim: true
        },

        city: {
            type: String,
            default: "",
            trim: true
        },

        address: {
            type: String,
            default: "",
            trim: true
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        }
    },
    {
        timestamps: true
    }
);


// ==========================================================
// ZM LABEL — PREVENT DUPLICATE MODEL ERROR
// ==========================================================

module.exports =
    mongoose.models.User ||
    mongoose.model("User", userSchema);