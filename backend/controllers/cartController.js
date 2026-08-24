const Cart = require("../models/Cart");


/* =========================================================
   GET USER CART
========================================================= */

const getCart = async (req, res) => {

    try {

        let cart = await Cart.findOne({
            user: req.user._id
        }).populate("items.product");


        /* ==========================================
           NO CART
        ========================================== */

        if (!cart) {

            return res.status(200).json({

                success: true,

                items: []

            });

        }


        /* ==========================================
           REMOVE BROKEN / DELETED PRODUCTS
        ========================================== */

        const validItems = cart.items.filter(
            item => item.product
        );


        /*
         * If some product was deleted from MongoDB,
         * its ObjectId remains inside cart.
         *
         * Remove those broken references automatically.
         */

        if (
            validItems.length !==
            cart.items.length
        ) {

            cart.items = validItems;

            await cart.save();

        }


        /* ==========================================
           RESPONSE
        ========================================== */

        return res.status(200).json({

            success: true,

            items: validItems

        });

    }

    catch (error) {

        console.error(
            "GET CART ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to load cart."

        });

    }

};


/* =========================================================
   ADD PRODUCT TO CART
========================================================= */

const addToCart = async (req, res) => {

    try {

        const {

            productId,
            quantity,
            size,
            color

        } = req.body;


        /* ==========================================
           VALIDATION
        ========================================== */

        if (!productId) {

            return res.status(400).json({

                success: false,

                message:
                    "Product ID is required."

            });

        }


        const qty =
            Math.max(
                1,
                Number(quantity) || 1
            );


        const cleanSize =
            String(
                size || ""
            ).trim();


        const cleanColor =
            String(
                color || ""
            ).trim();


        /* ==========================================
           CREATE / GET CART
        ========================================== */

        let cart =
            await Cart.findOne({

                user:
                    req.user._id

            });


        if (!cart) {

            cart =
                new Cart({

                    user:
                        req.user._id,

                    items: []

                });

        }


        /* ==========================================
           CHECK EXISTING ITEM
        ========================================== */

        const existingItem =
            cart.items.find(
                item => {

                    if (!item.product) {
                        return false;
                    }

                    return (

                        item.product.toString() ===
                        String(productId)

                        &&

                        String(
                            item.size || ""
                        ).trim() ===
                        cleanSize

                        &&

                        String(
                            item.color || ""
                        ).trim() ===
                        cleanColor

                    );

                }
            );


        /* ==========================================
           UPDATE EXISTING
        ========================================== */

        if (existingItem) {

            existingItem.quantity +=
                qty;

        }


        /* ==========================================
           ADD NEW
        ========================================== */

        else {

            cart.items.push({

                product:
                    productId,

                quantity:
                    qty,

                size:
                    cleanSize,

                color:
                    cleanColor

            });

        }


        await cart.save();


        /* ==========================================
           POPULATE UPDATED CART
        ========================================== */

        const updatedCart =
            await Cart
                .findById(
                    cart._id
                )
                .populate(
                    "items.product"
                );


        /* ==========================================
           REMOVE BROKEN PRODUCTS
        ========================================== */

        const validItems =
            updatedCart.items.filter(
                item =>
                    item.product
            );


        if (
            validItems.length !==
            updatedCart.items.length
        ) {

            updatedCart.items =
                validItems;

            await updatedCart.save();

        }


        /* ==========================================
           SUCCESS
        ========================================== */

        return res.status(200).json({

            success: true,

            message:
                "Product Added To Cart",

            items:
                validItems

        });

    }

    catch (error) {

        console.error(
            "ADD TO CART ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to add product to cart."

        });

    }

};


/* =========================================================
   REMOVE ITEM
========================================================= */

const removeCartItem = async (
    req,
    res
) => {

    try {

        const {
            productId
        } = req.params;


        const cart =
            await Cart.findOne({

                user:
                    req.user._id

            });


        if (!cart) {

            return res.status(404).json({

                success: false,

                message:
                    "Cart Not Found"

            });

        }


        cart.items =
            cart.items.filter(
                item => {

                    if (!item.product) {
                        return false;
                    }

                    return (
                        item.product.toString() !==
                        String(productId)
                    );

                }
            );


        await cart.save();


        return res.status(200).json({

            success: true,

            message:
                "Item Removed"

        });

    }

    catch (error) {

        console.error(
            "REMOVE CART ITEM ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


/* =========================================================
   UPDATE QUANTITY
========================================================= */

const updateQuantity = async (
    req,
    res
) => {

    try {

        const {
            productId
        } = req.params;


        const {
            quantity
        } = req.body;


        const newQuantity =
            Number(quantity);


        if (
            !Number.isFinite(
                newQuantity
            ) ||
            newQuantity < 1
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid quantity."

            });

        }


        const cart =
            await Cart.findOne({

                user:
                    req.user._id

            });


        if (!cart) {

            return res.status(404).json({

                success: false,

                message:
                    "Cart Not Found"

            });

        }


        const item =
            cart.items.find(
                item => {

                    if (!item.product) {
                        return false;
                    }

                    return (
                        item.product.toString() ===
                        String(productId)
                    );

                }
            );


        if (!item) {

            return res.status(404).json({

                success: false,

                message:
                    "Item Not Found"

            });

        }


        item.quantity =
            newQuantity;


        await cart.save();


        const updatedCart =
            await Cart
                .findById(
                    cart._id
                )
                .populate(
                    "items.product"
                );


        const validItems =
            updatedCart.items.filter(
                item =>
                    item.product
            );


        if (
            validItems.length !==
            updatedCart.items.length
        ) {

            updatedCart.items =
                validItems;

            await updatedCart.save();

        }


        return res.status(200).json({

            success: true,

            items:
                validItems

        });

    }

    catch (error) {

        console.error(
            "UPDATE CART ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


/* =========================================================
   CLEAR CART
========================================================= */

const clearCart = async (
    req,
    res
) => {

    try {

        const cart =
            await Cart.findOne({

                user:
                    req.user._id

            });


        if (!cart) {

            return res.status(200).json({

                success: true,

                message:
                    "Cart Already Empty"

            });

        }


        cart.items = [];


        await cart.save();


        return res.status(200).json({

            success: true,

            message:
                "Cart Cleared Successfully"

        });

    }

    catch (error) {

        console.error(
            "CLEAR CART ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {

    getCart,

    addToCart,

    removeCartItem,

    updateQuantity,

    clearCart

};