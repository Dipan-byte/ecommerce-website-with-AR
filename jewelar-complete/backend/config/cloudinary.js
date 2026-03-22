// config/cloudinary.js — Cloudinary Setup + Multer Storage

const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for product images
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "jewelar/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

// Storage for try-on overlay images
const tryonStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "jewelar/tryon",
    allowed_formats: ["png", "webp"],
  },
});

const uploadProduct = multer({ storage: productStorage });
const uploadTryon   = multer({ storage: tryonStorage });

module.exports = { cloudinary, uploadProduct, uploadTryon };