const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ==========================================================
// CREATE JWT
// ==========================================================

function generateToken(userId) {

    return jwt.sign(
        {
            id: userId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

}


// ==========================================================
// REGISTER USER
// ==========================================================

exports.registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            phone
        } = req.body;


        // ==================================================
        // VALIDATION
        // ==================================================

        if (
            !name ||
            !email ||
            !phone ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, email, phone and password are required."

            });

        }


        if (password.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must be at least 6 characters."

            });

        }


        // ==================================================
        // CLEAN DATA
        // ==================================================

        const cleanName =
            String(name)
                .trim();

        const cleanEmail =
            String(email)
                .trim()
                .toLowerCase();

        const cleanPhone =
            String(phone)
                .trim();


        // ==================================================
        // CHECK EMAIL
        // ==================================================

        const emailExists =
            await User.findOne({
                email: cleanEmail
            });


        if (emailExists) {

            return res.status(400).json({

                success: false,

                message:
                    "User with this email already exists."

            });

        }


        // ==================================================
        // CHECK PHONE
        // ==================================================

        const phoneExists =
            await User.findOne({
                phone: cleanPhone
            });


        if (phoneExists) {

            return res.status(400).json({

                success: false,

                message:
                    "User with this phone number already exists."

            });

        }


        // ==================================================
        // HASH PASSWORD
        // ==================================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ==================================================
        // CREATE USER
        // ==================================================

        const user =
            await User.create({

                name:
                    cleanName,

                email:
                    cleanEmail,

                password:
                    hashedPassword,

                phone:
                    cleanPhone,

                role:
                    "user"

            });


        // ==================================================
        // SAFE USER
        // ==================================================

        const safeUser =
            await User.findById(
                user._id
            ).select("-password");


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(201).json({

            success: true,

            message:
                "User Registered Successfully",

            user:
                safeUser

        });

    }

    catch (error) {

        console.error(
            "REGISTER USER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};



// ==========================================================
// LOGIN USER / ADMIN
//
// REQUIRED:
// EMAIL + PHONE + PASSWORD
//
// ADMIN:
// role must also be "admin"
// ==========================================================

exports.loginUser = async (req, res) => {

    try {

        const {
            email,
            phone,
            password
        } = req.body;


        // ==================================================
        // VALIDATION
        // ==================================================

        if (
            !email ||
            !phone ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email, phone and password are required."

            });

        }


        // ==================================================
        // CLEAN DATA
        // ==================================================

        const cleanEmail =
            String(email)
                .trim()
                .toLowerCase();

        const cleanPhone =
            String(phone)
                .trim();


        // ==================================================
        // FIND ACCOUNT
        // ==================================================

        const user =
            await User.findOne({
                email: cleanEmail
            });


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "No account found with this email."

            });

        }


        // ==================================================
        // PHONE MATCH
        // ==================================================

        const savedPhone =
            String(user.phone || "")
                .trim();


        if (
            !savedPhone ||
            savedPhone !== cleanPhone
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Email and WhatsApp number do not match."

            });

        }


        // ==================================================
        // PASSWORD MATCH
        // ==================================================

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid password."

            });

        }


        // ==================================================
        // CREATE TOKEN
        // ==================================================

        const token =
            generateToken(
                user._id
            );


        // ==================================================
        // SAFE USER
        // ==================================================

        const safeUser =
            await User.findById(
                user._id
            ).select("-password");


        // ==================================================
        // SUCCESS
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Login Successful",

            token,

            user:
                safeUser

        });

    }

    catch (error) {

        console.error(
            "LOGIN USER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error during login."

        });

    }

};



// ==========================================================
// REGISTER ADMIN
//
// ADMIN ACCOUNT:
// NAME + EMAIL + PHONE + PASSWORD
// ==========================================================

exports.registerAdmin = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password
        } = req.body;


        // ==================================================
        // VALIDATION
        // ==================================================

        if (
            !email ||
            !phone ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email, phone and password are required."

            });

        }


        if (password.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must be at least 6 characters."

            });

        }


        // ==================================================
        // CLEAN DATA
        // ==================================================

        const cleanName =
            name
                ? String(name).trim()
                : "ZM LABEL Admin";

        const cleanEmail =
            String(email)
                .trim()
                .toLowerCase();

        const cleanPhone =
            String(phone)
                .trim();


        // ==================================================
        // CHECK EMAIL
        // ==================================================

        const emailExists =
            await User.findOne({
                email: cleanEmail
            });


        if (emailExists) {

            return res.status(400).json({

                success: false,

                message:
                    "User with this email already exists."

            });

        }


        // ==================================================
        // CHECK PHONE
        // ==================================================

        const phoneExists =
            await User.findOne({
                phone: cleanPhone
            });


        if (phoneExists) {

            return res.status(400).json({

                success: false,

                message:
                    "User with this phone number already exists."

            });

        }


        // ==================================================
        // HASH PASSWORD
        // ==================================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ==================================================
        // CREATE ADMIN
        // ==================================================

        const admin =
            await User.create({

                name:
                    cleanName,

                email:
                    cleanEmail,

                phone:
                    cleanPhone,

                password:
                    hashedPassword,

                role:
                    "admin"

            });


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(201).json({

            success: true,

            message:
                "Admin Registered Successfully",

            user: {

                id:
                    admin._id,

                name:
                    admin.name,

                email:
                    admin.email,

                phone:
                    admin.phone,

                role:
                    admin.role

            }

        });

    }

    catch (error) {

        console.error(
            "REGISTER ADMIN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};



// ==========================================================
// LOGIN ADMIN
//
// REQUIRED:
// EMAIL + PHONE + PASSWORD
//
// AND:
// role === "admin"
// ==========================================================

exports.loginAdmin = async (req, res) => {

    try {

        const {
            email,
            phone,
            password
        } = req.body;


        // ==================================================
        // VALIDATION
        // ==================================================

        if (
            !email ||
            !phone ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Admin email, phone and password are required."

            });

        }


        // ==================================================
        // CLEAN DATA
        // ==================================================

        const cleanEmail =
            String(email)
                .trim()
                .toLowerCase();

        const cleanPhone =
            String(phone)
                .trim();


        // ==================================================
        // FIND ADMIN BY EMAIL
        // ==================================================

        const admin =
            await User.findOne({
                email: cleanEmail
            });


        if (!admin) {

            return res.status(404).json({

                success: false,

                message:
                    "Admin account not found."

            });

        }


        // ==================================================
        // ROLE CHECK
        // ==================================================

        if (
            admin.role !==
            "admin"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Admin access only."

            });

        }


        // ==================================================
        // PHONE CHECK
        // ==================================================

        const savedPhone =
            String(admin.phone || "")
                .trim();


        if (
            !savedPhone ||
            savedPhone !== cleanPhone
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Admin email and WhatsApp number do not match."

            });

        }


        // ==================================================
        // PASSWORD CHECK
        // ==================================================

        const isMatch =
            await bcrypt.compare(
                password,
                admin.password
            );


        if (!isMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid admin password."

            });

        }


        // ==================================================
        // TOKEN
        // ==================================================

        const token =
            generateToken(
                admin._id
            );


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            message:
                "Admin Login Successful",

            token,

            user: {

                id:
                    admin._id,

                name:
                    admin.name,

                email:
                    admin.email,

                phone:
                    admin.phone,

                role:
                    admin.role

            }

        });

    }

    catch (error) {

        console.error(
            "LOGIN ADMIN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error during admin login."

        });

    }

};



// ==========================================================
// GET ALL USERS - ADMIN
// ==========================================================

exports.getAllUsers = async (req, res) => {

    try {

        const users =
            await User.find()
                .select("-password")
                .sort({
                    createdAt: -1
                });


        return res.json({

            success: true,

            users

        });

    }

    catch (error) {

        console.error(
            "GET ALL USERS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};



// ==========================================================
// GET LOGGED-IN USER
// ==========================================================

exports.getMe = async (req, res) => {

    try {

        const userId =
            req.user?._id ||
            req.user?.id;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "User not authenticated"

            });

        }


        const user =
            await User.findById(userId)
                .select("-password");


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User Not Found"

            });

        }


        return res.json({

            success: true,

            user

        });

    }

    catch (error) {

        console.error(
            "GET ME ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};



// ==========================================================
// UPDATE MY PROFILE
// ==========================================================

exports.updateProfile = async (req, res) => {

    try {

        const userId =
            req.user?._id ||
            req.user?.id;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "User not authenticated"

            });

        }


        const {
            name,
            phone,
            city,
            address
        } = req.body;


        const user =
            await User.findById(
                userId
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User Not Found"

            });

        }


        // ==================================================
        // NAME
        // ==================================================

        if (name !== undefined) {

            user.name =
                String(name)
                    .trim();

        }


        // ==================================================
        // PHONE
        // ==================================================

        if (phone !== undefined) {

            const cleanPhone =
                String(phone)
                    .trim();


            // Check if another account
            // already owns this phone

            const phoneExists =
                await User.findOne({

                    phone:
                        cleanPhone,

                    _id: {
                        $ne:
                            userId
                    }

                });


            if (phoneExists) {

                return res.status(400).json({

                    success: false,

                    message:
                        "This phone number is already in use."

                });

            }


            user.phone =
                cleanPhone;

        }


        // ==================================================
        // CITY
        // ==================================================

        if (city !== undefined) {

            user.city =
                String(city)
                    .trim();

        }


        // ==================================================
        // ADDRESS
        // ==================================================

        if (address !== undefined) {

            user.address =
                String(address)
                    .trim();

        }


        // ==================================================
        // SAVE
        // ==================================================

        await user.save();


        // ==================================================
        // UPDATED USER
        // ==================================================

        const updatedUser =
            await User.findById(
                user._id
            ).select("-password");


        return res.json({

            success: true,

            message:
                "Profile Updated Successfully",

            user:
                updatedUser

        });

    }

    catch (error) {

        console.error(
            "UPDATE PROFILE ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};