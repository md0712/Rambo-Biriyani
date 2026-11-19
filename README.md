# RAMBO BIRIYANI — Bold Flavours. No Mercy.

[![React](https://img.shields.io/badge/React-18.3.1-red.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0.1-orange.svg)](https://vitejs.dev/)
[![Status](https://img.shields.io/badge/Kitchen-Live%20Dum%20Firing-green.svg)](#)

> **"Authentic, aromatic and aggressively delicious biriyani crafted for true food warriors."**

**Rambo Biriyani** is a full-stack digital restaurant storefront and kitchen operations platform. Built strictly following the reference brand design, featuring high-voltage fiery visuals, direct WhatsApp ordering, real-time cart and delivery mode switches, menu taxonomy, and a comprehensive kitchen management system.

---

## 🍽️ Key Features

### 1. Customer Storefront
- **Reference UI Recreation**:
  - Distressed battle red & gold military stencil logo with wings and star
  - Fiery hero banner: `"BOLD FLAVOURS. NO MERCY."` with sizzling hot dum handi
  - Trust signals bar: `Authentic Dum Style`, `Premium Ingredients`, `Rich & Aromatic`, `Consistent Quality`
  - **Explore Our Menu Tabs**: `Biriyanis`, `Add Ons`, `Combos`, `Beverages`
  - **Direct One-Click Add**: Fast action circular button adding items straight to the warrior cart
  - **Our Story Parchment Card**: Traditional wood-fired heritage with helicopter and mountain soldier graphic
  - **Bottom Contact & Quick Order Bar**: Direct WhatsApp ordering (`+91 98765 43210`), Home Delivery badge, Takeaway pickup, Location pin, and Opening Hours
- **Interactive Sliding Cart Drawer**:
  - Live item count and total calculation in Indian Rupee (`₹`)
  - Home Delivery vs. Takeaway pick-up selector
  - **One-Click WhatsApp Order**: Pre-populates formatted WhatsApp message with items, quantities, and delivery address directly to `+91 98765 43210`
  - Standard Cash / UPI Checkout option

### 2. Kitchen Administration & Command Center (`/admin`)
- **Protected Routing (`ProtectedRoute.jsx`)**: Enforces authentication (`Admin` and `Manager` privileges)
- **Live Kitchen Dashboard**: Today's biriyani sales, processed orders count, dum portions remaining in handis, riders on road
- **Live Orders Stream (`/admin/orders`)**: Kitchen workflow status progression (`Order Placed` ➔ `Cooking on Dum` ➔ `Out for Delivery` ➔ `Delivered`)
- **Biriyani & Menu Management (`/admin/products`)**: Add and edit Biriyani SKUs, portion sizes, prices in `₹`, spice levels (`Classic`, `Fiery`, `Intense`, `Chef Signature`), and stock tracking
- **Categories Taxonomy (`/admin/categories`)**: Manage collections (`Biriyanis`, `Add Ons`, `Combos`, `Beverages`, `Desserts`)
- **Sales Analytics & Run-Rate (`/admin/reports`)**: Category revenue shares, AOV, peak rush hours, and CSV exports
- **Kitchen Alerts (`/admin/notifications`)**: Low handi dum warnings, new WhatsApp inquiries, and delivery rush alerts
- **Outlet Configuration (`/admin/settings`)**: Outlet locations, WhatsApp ordering numbers, free delivery thresholds, and POS API keys

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Master Chef (Admin)** | `admin@rambo.com` | `admin123` | Full access to Kitchen Dashboard & Storefront |
| **Foodie Customer** | `marcus@outlook.com` e `marcus123` | Storefront ordering and customer profile |

*Quick one-click demo login buttons are provided on the `/login` screen.*
