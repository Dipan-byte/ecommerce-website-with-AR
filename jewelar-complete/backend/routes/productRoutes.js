// routes/productRoutes.js
const express = require("express");
const router  = express.Router();
const {
  getProducts, getProductById, getFeaturedProducts,
  createProduct, updateProduct, deleteProduct, addReview,
} = require("../controllers/productController");
const { protect, adminOnly }   = require("../middleware/authMiddleware");
const { uploadProduct }        = require("../config/cloudinary");

router.get("/",          getProducts);
router.get("/featured",  getFeaturedProducts);
router.get("/:id",       getProductById);

// Admin CRUD
router.post(  "/",    protect, adminOnly, uploadProduct.array("images", 5), createProduct);
router.put(   "/:id", protect, adminOnly, uploadProduct.array("images", 5), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

// Reviews
router.post("/:id/reviews", protect, addReview);

module.exports = router;
