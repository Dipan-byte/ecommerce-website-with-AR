// routes/uploadRoutes.js — Generic upload endpoint for try-on assets

const express = require("express");
const router  = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { uploadTryon, cloudinary } = require("../config/cloudinary");

// @desc    Upload try-on asset (transparent PNG)
// @route   POST /api/upload/tryon
// @access  Admin
router.post(
  "/tryon",
  protect,
  adminOnly,
  uploadTryon.single("asset"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    res.json({
      success: true,
      url: req.file.path,
      public_id: req.file.filename,
    });
  }
);

// @desc    Delete a Cloudinary asset
// @route   DELETE /api/upload/:publicId
// @access  Admin
router.delete("/:publicId", protect, adminOnly, async (req, res) => {
  try {
    const result = await cloudinary.uploader.destroy(
      decodeURIComponent(req.params.publicId)
    );
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
