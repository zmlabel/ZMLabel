const Product = require("../models/Product");


// =========================================================
// HELPERS
// =========================================================

function parseArray(value) {

    if (!value) {
        return [];
    }

    // Already array
    if (Array.isArray(value)) {
        return value
            .map(item => String(item).trim())
            .filter(Boolean);
    }

    // JSON array
    if (typeof value === "string") {

        try {

            const parsed = JSON.parse(value);

            if (Array.isArray(parsed)) {

                return parsed
                    .map(item => String(item).trim())
                    .filter(Boolean);

            }

        } catch (error) {
            // Not JSON — continue below
        }

        // Comma separated
        return value
            .split(",")
            .map(item => item.trim())
            .filter(Boolean);
    }

    return [];
}


// =========================================================
// ADD PRODUCT
// =========================================================

exports.addProduct = async (req, res) => {

    try {

        const {

            name,
            brand,
            category,
            subCategory,
            description,
            price,
            discount,
            stock,
            badge,
            featured,
            showOnHome,
            status

        } = req.body;


        // -----------------------------------------
        // COLORS
        // -----------------------------------------

        const colors = parseArray(
            req.body.colors
        );


        // -----------------------------------------
        // SIZES
        // -----------------------------------------

        const sizes = parseArray(
            req.body.sizes
        );


        // -----------------------------------------
        // IMAGES
        // -----------------------------------------

        const images =
            Array.isArray(req.files)
                ? req.files
                    .map(file => file.filename)
                    .filter(Boolean)
                : [];


        const mainImage =
            images.length
                ? images[0]
                : "";


        // -----------------------------------------
        // REQUIRED IMAGE CHECK
        // -----------------------------------------

        if (!mainImage) {

            return res.status(400).json({

                success: false,

                message: "At least one product image is required."

            });

        }


        // -----------------------------------------
        // CREATE PRODUCT
        // -----------------------------------------

        const product = await Product.create({

            name: name || "",

            brand: brand || "",

            category: category || "",

            subCategory: subCategory || "",

            description: description || "",

            price: Number(price) || 0,

            discount: Number(discount) || 0,

            stock: Number(stock) || 0,

            badge: badge || "",

            featured:
                featured === true ||
                featured === "true",

            showOnHome:
                showOnHome === true ||
                showOnHome === "true",

            colors,

            sizes,

            status:
                status || "Active",

            image: mainImage,

images: images

        });


        // -----------------------------------------
        // SUCCESS
        // -----------------------------------------

        return res.status(201).json({

            success: true,

            message: "Product Added Successfully",

            product

        });

    }

    catch (error) {

        console.error(
            "ADD PRODUCT ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// =========================================================
// GET ALL PRODUCTS
// =========================================================

exports.getProducts = async (req, res) => {

    try {

        const products =
            await Product
                .find()
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            products

        });

    }

    catch (error) {

        console.error(
            "GET PRODUCTS ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// =========================================================
// GET SINGLE PRODUCT
// =========================================================

exports.getSingleProduct = async (req, res) => {

    try {

        const product =
            await Product.findById(
                req.params.id
            );


        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product Not Found"

            });

        }


        return res.json({

            success: true,

            product

        });

    }

    catch (error) {

        console.error(
            "GET SINGLE PRODUCT ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// =========================================================
// UPDATE PRODUCT
// =========================================================

exports.updateProduct = async (req, res) => {

    try {

        const data = {
            ...req.body
        };


        // -----------------------------------------
        // COLORS
        // -----------------------------------------

        if (
            req.body.colors !== undefined
        ) {

            data.colors =
                parseArray(
                    req.body.colors
                );

        }


        // -----------------------------------------
        // SIZES
        // -----------------------------------------

        if (
            req.body.sizes !== undefined
        ) {

            data.sizes =
                parseArray(
                    req.body.sizes
                );

        }


        // -----------------------------------------
        // NUMBER FIELDS
        // -----------------------------------------

        if (
            req.body.price !== undefined
        ) {

            data.price =
                Number(req.body.price) || 0;

        }


        if (
            req.body.discount !== undefined
        ) {

            data.discount =
                Number(req.body.discount) || 0;

        }


        if (
            req.body.stock !== undefined
        ) {

            data.stock =
                Number(req.body.stock) || 0;

        }


        // -----------------------------------------
        // BOOLEAN FIELDS
        // -----------------------------------------

        if (
            req.body.featured !== undefined
        ) {

            data.featured =
                req.body.featured === true ||
                req.body.featured === "true";

        }


        if (
            req.body.showOnHome !== undefined
        ) {

            data.showOnHome =
                req.body.showOnHome === true ||
                req.body.showOnHome === "true";

        }


        // -----------------------------------------
        // NEW IMAGE
        // -----------------------------------------

        if (
            Array.isArray(req.files) &&
            req.files.length
        ) {

          if (
    Array.isArray(req.files) &&
    req.files.length
) {

    const uploadedImages =
        req.files
            .map(file => file.filename)
            .filter(Boolean);


    if (uploadedImages.length) {

        data.image =
            uploadedImages[0];

        data.images =
            uploadedImages;

    }

}

        }


        // -----------------------------------------
        // UPDATE
        // -----------------------------------------

        const product =
            await Product.findByIdAndUpdate(

                req.params.id,

                data,

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product Not Found"

            });

        }


        return res.json({

            success: true,

            message: "Product Updated Successfully",

            product

        });

    }

    catch (error) {

        console.error(
            "UPDATE PRODUCT ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// =========================================================
// DELETE PRODUCT
// =========================================================

exports.deleteProduct = async (req, res) => {

    try {

        const product =
            await Product.findByIdAndDelete(
                req.params.id
            );


        if (!product) {

            return res.status(404).json({

                success: false,

                message: "Product Not Found"

            });

        }


        return res.json({

            success: true,

            message: "Product Deleted Successfully"

        });

    }

    catch (error) {

        console.error(
            "DELETE PRODUCT ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};