# 💎 JewelAR — AI-Powered Jewellery E-Commerce with Virtual Try-On

> A hackathon-ready MERN stack project featuring real-time jewellery try-on using MediaPipe Face Mesh.

---

## 🏗️ Tech Stack

| Layer      | Technology                                         |
|------------|----------------------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS + Framer Motion     |
| State      | Redux Toolkit + RTK                                |
| Backend    | Node.js + Express (MVC)                            |
| Database   | MongoDB + Mongoose                                 |
| Auth       | JWT in HTTP-only cookies                           |
| Images     | Cloudinary + Multer                                |
| AR Try-On  | MediaPipe Face Mesh (browser, no server needed)    |

---

## 📂 Folder Structure

```
jewelar/
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   ├── cloudinary.js       # Cloudinary + Multer
│   │   └── seed.js             # Demo data seeder
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT protect + adminOnly
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   └── userRoutes.js
│   ├── server.js
│   └── .env.example
│
└── frontend/
    └── src/
        ├── components/
        │   ├── ar/
        │   │   └── TryOnCanvas.jsx   # 🔥 MediaPipe AR component
        │   ├── common/
        │   │   ├── Spinner.jsx
        │   │   └── ProductCard.jsx
        │   └── layout/
        │       ├── Navbar.jsx
        │       └── Footer.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── ProductList.jsx
        │   ├── ProductDetail.jsx
        │   ├── Cart.jsx
        │   ├── Checkout.jsx
        │   ├── OrderSuccess.jsx
        │   ├── MyOrders.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── TryOn.jsx             # 🔥 AR Experience Page
        │   └── admin/
        │       ├── Dashboard.jsx
        │       ├── Products.jsx
        │       └── Orders.jsx
        ├── store/
        │   ├── index.js
        │   └── slices/
        │       ├── authSlice.js
        │       └── cartSlice.js
        └── utils/
            ├── axios.js
            └── helpers.js
```

---

## 🚀 Setup & Running Locally

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- Cloudinary account (free tier works)

---

### 1. Clone / unzip the project

```bash
cd jewelar
```

---

### 2. Backend Setup

```bash
cd backend
npm install

# Copy and fill in environment variables
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/jewelar
JWT_SECRET=your_super_secret_key_change_me
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

> 💡 Get free Cloudinary credentials at https://cloudinary.com

```bash
# Seed the database with demo products + users
npm run seed

# Start backend (development with nodemon)
npm run dev
```

Backend runs at: **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### 4. Demo Credentials

| Role  | Email                | Password   |
|-------|----------------------|------------|
| Admin | admin@jewelar.com    | admin123   |
| User  | user@jewelar.com     | user123    |

These are also available as quick-fill buttons on the Login page.

---

## 🪄 Virtual Try-On — How It Works

```
Webcam (getUserMedia)
       ↓
<video> element (hidden)
       ↓
MediaPipe FaceMesh (browser WASM)
  → Returns 468 3D face landmarks at 30fps
       ↓
TryOnCanvas.jsx extracts:
  • Landmark [234] → Left ear position
  • Landmark [454] → Right ear position
  • Landmark [4]   → Nose tip
  • Landmark [152] → Chin (for necklace extrapolation)
  • Inter-landmark distances → scale the overlay
  • Face tilt angle → rotate the overlay
  • Z-depth difference → fade hidden ear (head turn)
       ↓
Canvas drawImage() → Jewellery PNG overlaid
       ↓
requestAnimationFrame → 60fps live rendering
```

### Adding Real Try-On Assets

1. Get transparent **PNG** images of your jewellery (no background)
2. Upload to Cloudinary manually or via Admin panel
3. Set the Cloudinary URL as `tryOnAsset` on the product
4. Set `tryOnType` to `earring`, `nose`, or `necklace`

The system will auto-scale and position the overlay based on face geometry.

---

## 📡 API Reference

### Auth
| Method | Route                  | Access  |
|--------|------------------------|---------|
| POST   | /api/auth/register     | Public  |
| POST   | /api/auth/login        | Public  |
| POST   | /api/auth/logout       | Private |
| GET    | /api/auth/me           | Private |

### Products
| Method | Route                        | Access  |
|--------|------------------------------|---------|
| GET    | /api/products                | Public  |
| GET    | /api/products/featured       | Public  |
| GET    | /api/products/:id            | Public  |
| POST   | /api/products                | Admin   |
| PUT    | /api/products/:id            | Admin   |
| DELETE | /api/products/:id            | Admin   |
| POST   | /api/products/:id/reviews    | Private |

### Orders
| Method | Route                        | Access  |
|--------|------------------------------|---------|
| POST   | /api/orders                  | Private |
| GET    | /api/orders/my               | Private |
| GET    | /api/orders/:id              | Private |
| GET    | /api/orders                  | Admin   |
| GET    | /api/orders/stats            | Admin   |
| PUT    | /api/orders/:id/status       | Admin   |

---

## 🧩 Key Features

- ✅ JWT auth with HTTP-only cookies (secure, XSS-safe)
- ✅ Role-based access: user vs admin
- ✅ Full product CRUD with Cloudinary image upload
- ✅ Cart persisted in localStorage
- ✅ Mock checkout with 3-step flow
- ✅ Admin dashboard with stats + order management
- ✅ MediaPipe Face Mesh AR try-on (earrings, nose pins, necklaces)
- ✅ Face tracking: scale, rotate, and fade overlays with face movement
- ✅ Privacy-first: all AR processing is 100% in-browser
- ✅ Responsive design with Tailwind CSS
- ✅ Framer Motion animations throughout
- ✅ React Hot Toast notifications

---

## 🐛 Troubleshooting

**Camera not working?**
- Try-On requires HTTPS in production. Localhost works fine in dev.
- Ensure browser has camera permission (`chrome://settings/content/camera`)

**MediaPipe slow to load?**
- First load downloads WASM files (~10MB) from CDN. Subsequent loads use cache.

**Products not showing in Try-On?**
- Product must have both `tryOnType` AND `tryOnAsset` set
- `tryOnAsset` must be a URL to a **transparent PNG**

**Cloudinary upload failing?**
- Double-check your `.env` credentials
- Ensure the Cloudinary free plan isn't exhausted (25GB storage)

---

## 🏆 Hackathon Demo Flow

1. Open app → Hero page with "Try On Now" CTA
2. Login as demo user (quick-fill button)
3. Browse products → click "Try On" on any earring
4. Camera opens → face detected → earrings appear in real time
5. Select different jewellery from the panel
6. Add to cart → checkout → order placed
7. Switch to admin → view orders, add products

---

Made with 💎 for hackathons
