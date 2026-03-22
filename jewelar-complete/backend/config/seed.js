// config/seed.js — Seed demo products + admin user

const mongoose = require("mongoose");
const dotenv   = require("dotenv");
dotenv.config();

const User    = require("../models/User");
const Product = require("../models/Product");

const products = [
  {
    name: "Diamond Cascade Earrings",
    description: "Stunning cascading diamond drop earrings crafted in 18K white gold. Perfect for formal occasions.",
    price: 12999,
    category: "earrings",
    stock: 15,
    images: ["https://placehold.co/400x400/d4af37/fff?text=Earrings"],
    tryOnAsset: "https://placehold.co/80x120/d4af37/fff?text=Earring",
    tryOnType: "earring",
    material: "18K White Gold",
    weight: "4.2g",
    featured: true,
  },
  {
    name: "Pearl Stud Earrings",
    description: "Classic freshwater pearl studs set in sterling silver. Timeless elegance for everyday wear.",
    price: 2499,
    category: "earrings",
    stock: 30,
    images: ["https://placehold.co/400x400/f5f5f0/333?text=Pearl+Studs"],
    tryOnAsset: "https://placehold.co/60x60/f5f5f0/333?text=Pearl",
    tryOnType: "earring",
    material: "Sterling Silver",
    weight: "2.1g",
    featured: true,
  },
  {
    name: "Gold Nose Pin",
    description: "Delicate 22K gold nose pin with a tiny CZ stone. Traditional design with a modern finish.",
    price: 899,
    category: "nose-pins",
    stock: 50,
    images: ["https://placehold.co/400x400/ffd700/333?text=Nose+Pin"],
    tryOnAsset: "https://placehold.co/30x30/ffd700/333?text=*",
    tryOnType: "nose",
    material: "22K Gold",
    weight: "0.5g",
    featured: false,
  },
  {
    name: "Ruby Choker Necklace",
    description: "Luxurious ruby and diamond choker in 18K yellow gold. A statement piece for special occasions.",
    price: 45999,
    category: "necklaces",
    stock: 8,
    images: ["https://placehold.co/400x400/9b1313/fff?text=Ruby+Choker"],
    tryOnAsset: "https://placehold.co/200x60/9b1313/fff?text=Necklace",
    tryOnType: "necklace",
    material: "18K Yellow Gold",
    weight: "18.5g",
    featured: true,
  },
  {
    name: "Emerald Hoop Earrings",
    description: "Bold emerald-studded hoop earrings in rose gold. A modern classic for the fashion-forward.",
    price: 8499,
    category: "earrings",
    stock: 20,
    images: ["https://placehold.co/400x400/2ecc71/fff?text=Emerald+Hoops"],
    tryOnAsset: "https://placehold.co/70x70/2ecc71/fff?text=Hoop",
    tryOnType: "earring",
    material: "14K Rose Gold",
    weight: "5.8g",
    featured: true,
  },
  {
    name: "Sapphire Tennis Bracelet",
    description: "Elegant blue sapphire tennis bracelet in platinum setting. 3.5 carats total weight.",
    price: 28999,
    category: "bracelets",
    stock: 12,
    images: ["https://placehold.co/400x400/1a4fa0/fff?text=Sapphire"],
    tryOnAsset: null,
    tryOnType: null,
    material: "Platinum",
    weight: "12.3g",
    featured: false,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    // NOTE: Do NOT hash password here
    // The User model pre-save hook handles hashing automatically
    const admin = await User.create({
      name:     "Admin User",
      email:    "admin@jewelar.com",
      password: "admin123",
      role:     "admin",
    });

    // Create regular user
    await User.create({
      name:     "Demo User",
      email:    "user@jewelar.com",
      password: "user123",
      role:     "user",
    });

    // Seed products
    await Product.insertMany(products);

    console.log("\n✅ Seed successful!");
    console.log("👤 Admin:  admin@jewelar.com / admin123");
    console.log("👤 User:   user@jewelar.com  / user123");
    console.log(`💎 Products seeded: ${products.length}\n`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
};

seed();