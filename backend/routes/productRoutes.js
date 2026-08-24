const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const {

    addProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    getSingleProduct

} = require("../controllers/productController");

// ==========================
// ADD PRODUCT
// ==========================

router.post(

    "/add",

    upload.array("images", 10),

    addProduct

);

// ==========================
// GET ALL PRODUCTS
// ==========================

router.get(

    "/",

    getProducts

);

// ==========================
// GET SINGLE PRODUCT
// ==========================

router.get(

    "/:id",

    getSingleProduct

);

// ==========================
// UPDATE PRODUCT
// ==========================

router.put(

    "/update/:id",

    upload.single("image"),

    updateProduct

);

// ==========================
// DELETE PRODUCT
// ==========================

router.delete(

    "/delete/:id",

    deleteProduct

);

module.exports = router;