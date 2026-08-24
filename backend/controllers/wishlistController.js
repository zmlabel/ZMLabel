const Wishlist = require("../models/Wishlist");

/* ==========================================
GET USER WISHLIST
========================================== */

const getWishlist = async (req, res) => {

    try {

        const wishlist = await Wishlist.findOne({

            user: req.user._id

        }).populate("products");

        if (!wishlist) {

            return res.status(200).json({

                success: true,

                products: []

            });

        }

        res.status(200).json({

            success: true,

            products: wishlist.products

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
ADD / REMOVE WISHLIST
========================================== */

const toggleWishlist = async (req, res) => {

    console.log("🔥 Wishlist Hit");
console.log(req.body);

    try {

        const { productId } = req.body;

        let wishlist = await Wishlist.findOne({

            user: req.user._id

        });
                if (!wishlist) {

            wishlist = new Wishlist({

                user: req.user._id,

                products: []

            });

        }

        const exists = wishlist.products.find(

            item => item.toString() === productId

        );

        if (exists) {

            wishlist.products = wishlist.products.filter(

                item => item.toString() !== productId

            );

        }

        else {

            wishlist.products.push(productId);

        }

        await wishlist.save();

        const updatedWishlist = await Wishlist.findById(

            wishlist._id

        ).populate("products");

        res.status(200).json({

    success:true,

    products:updatedWishlist.products,

    action: exists ? "removed" : "added"

});

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
/* ==========================================
EXPORTS
========================================== */

module.exports = {

    getWishlist,

    toggleWishlist

};