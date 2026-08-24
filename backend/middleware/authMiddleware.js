const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {

    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {

        try {

            token =
                req.headers.authorization
                    .split(" ")[1];


            if (!token) {

                return res.status(401).json({
                    success: false,
                    message: "No token"
                });

            }


            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );


            console.log(
                "TOKEN RECEIVED:",
                !!token
            );

            console.log(
                "JWT SECRET EXISTS:",
                !!process.env.JWT_SECRET
            );

            console.log(
                "DECODED TOKEN:",
                decoded
            );


            /*
             * GET ACTUAL USER FROM DATABASE
             *
             * This gives us:
             * _id
             * name
             * email
             * role
             * etc.
             */

            const user =
                await User.findById(
                    decoded.id
                ).select("-password");


            if (!user) {

                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });

            }


            /*
             * FULL AUTHENTICATED USER
             */

            req.user =
                user;


            console.log(
                "AUTH USER:",
                {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            );


            next();

        }
        catch (error) {

            console.error(
                "JWT verification failed:",
                error.message
            );


            return res.status(401).json({

                success: false,

                message:
                    "Not authorized"

            });

        }

    }
    else {

        return res.status(401).json({

            success: false,

            message:
                "No token"

        });

    }

};


module.exports = {
    protect
};