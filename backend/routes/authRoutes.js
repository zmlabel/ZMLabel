
const express = require("express");

const router = express.Router();


// ==========================================================
// MIDDLEWARE
// ==========================================================

const {
    protect
} = require("../middleware/authMiddleware");

const {
    admin
} = require("../middleware/adminMiddleware");


// ==========================================================
// CONTROLLER
// ==========================================================

const {
    registerUser,
    loginUser,
    registerAdmin,
    loginAdmin,
    getAllUsers,
    getMe,
    updateProfile
} = require("../controllers/authController");


// ==========================================================
// USER AUTH
// ==========================================================

// POST /api/auth/register

router.post(
    "/register",
    registerUser
);


// POST /api/auth/login

router.post(
    "/login",
    loginUser
);


// ==========================================================
// ADMIN AUTH
// ==========================================================

// POST /api/auth/admin/register

router.post(
    "/admin/register",
    registerAdmin
);


// POST /api/auth/admin/login

router.post(
    "/admin/login",
    loginAdmin
);


// ==========================================================
// LOGGED-IN USER
// ==========================================================

// GET /api/auth/me

router.get(
    "/me",
    protect,
    getMe
);


// PUT /api/auth/me

router.put(
    "/me",
    protect,
    updateProfile
);


// ==========================================================
// ADMIN
// ==========================================================

// GET /api/auth/users

router.get(
    "/users",
    protect,
    admin,
    getAllUsers
);


// ==========================================================
// EXPORT
// ==========================================================

module.exports = router;
