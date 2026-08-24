const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// ==========================================
// LOAD ENVIRONMENT VARIABLES FIRST
// ==========================================
dotenv.config();

const app = express();

app.use(cors({ 
  origin: "https://zm-label.vercel.app",
  credentials: true 
}));

app.use(express.json());

// ==========================================
// DATABASE
// ==========================================
const connectDB = require("./config/db");

// ==========================================
// ROUTES
// ==========================================
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const aiRoutes = require("./routes/aiRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const couponRoutes = require("./routes/couponRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// ==========================================
// CREATE APP
// ==========================================
const app = express();

// ==========================================
// CONNECT DATABASE - Vercel ke liye lazy connect
// ==========================================
let isConnected = false;
const connectToDatabase = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};
app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// UPLOADS - Vercel pe disabled
// ==========================================
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// HOME
// ==========================================
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "🚀 ZM LABEL Backend Running Successfully..."
    });
});

// ==========================================
// API ROUTES
// ==========================================
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/ai", aiRoutes);
app.use("/reviews", reviewRoutes);
app.use("/admin", adminRoutes);
app.use("/coupons", couponRoutes);
app.use("/payments", paymentRoutes);

// ==========================================
// 404 ROUTE
// ==========================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(err?.status || 500).json({
        success: false,
        message: err?.message || "Internal server error."
    });
});

// ==========================================
// SERVER
// ==========================================
module.exports = app;