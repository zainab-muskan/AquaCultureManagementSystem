# 🐟 Fish Farming Guide

A comprehensive, smart aquaculture management platform (ERP) and marketplace connecting fish farmers to consumers. This platform digitalizes the entire aquaculture lifecycle—from pond engineering and water quality tracking to financial ROI and consumer sales.

## 🌟 Key Features & Farm Activities

### 1. 📊 Dashboard & Smart Alerts
The central hub for the farm owner. It provides a bird's-eye view of all active ponds, live activity logs, and a **Smart Alerts Hub**.
* **Alerts:** Real-time notifications for critical water quality violations, disease outbreaks, overdue feeding/fertilizer schedules, and harvest-ready fish batches.
> 📸 *Place your screenshot here:*
> `![Dashboard & Alerts](./screenshots/dashboard_alerts.png)`

### 2. 🌊 Pond Management & Engineering
Handles the physical lifecycle of ponds. 
* **Capabilities:** Configure pond stage (nursery, grow-out), structure (earthen, concrete), and intensity. Automatically calculates required pond dimensions, capacity, and water volumes (Liters/Gallons). 
> 📸 *Place your screenshot here:*
> `![Pond Management](./screenshots/pond_management.png)`

### 3. 🐟 Species Management & Polyculture
A built-in biological encyclopedia for regional fish species (e.g., Rohu, Tilapia, Silver Carp).
* **Capabilities:** Enforces polyculture compatibility rules, monitors temperature/pH/DO limits, manages feeding zones (Surface, Column, Bottom), and enforces stocking density per acre.
> 📸 *Place your screenshot here:*
> `![Species Management](./screenshots/species_management.png)`

### 4. 🌾 Feeding Management & Nutrition
Tracks fish nutrition and feed inventory.
* **Capabilities:** Recommends daily feed quantities (kg) and types based on current fish biomass and water temperatures. Tracks the biological **Feed Conversion Ratio (FCR)** to ensure maximum growth efficiency.
> 📸 *Place your screenshot here:*
> `![Feeding Management](./screenshots/feed_management.png)`

### 5. 🌱 Fertilization
Maintains pond primary productivity without degrading water quality.
* **Capabilities:** Smart calculators for organic (manure) and inorganic (Urea, DAP) fertilizers based on pond acreage. Logs application history and updates fertilizer inventory.
> 📸 *Place your screenshot here:*
> `![Fertilization](./screenshots/fertilization.png)`

### 6. 🧪 Water Quality & Cycling
Critical environmental monitoring to prevent mortality.
* **Capabilities:** Logs readings for Temperature, pH, Dissolved Oxygen, and Ammonia. Guides farmers through Tubewell/Canal flushing vs. Mechanical filtration and triggers safety alerts.
> 📸 *Place your screenshot here:*
> `![Water Quality](./screenshots/water_quality.png)`

### 7. 🏥 Health & Disease Tracking
A complete veterinary logger and searchable disease catalog.
* **Capabilities:** Identify diseases via symptoms, log active outbreaks in specific ponds, apply treatments, and deduct medications from the farm's treatment inventory.
> 📸 *Place your screenshot here:*
> `![Health & Disease](./screenshots/health_management.png)`

### 8. 📦 Stock & Inventory Management
Centralized inventory tracking.
* **Capabilities:** Track live fish batches, feed bags, fertilizers, and medications. Supports transferring fish batches between ponds and tracks live asset valuations.
> 📸 *Place your screenshot here:*
> `![Inventory & Stock](./screenshots/inventory_stock.png)`

### 9. 💰 Financials (Budget & ROI)
Enterprise accounting for aquaculture.
* **Capabilities:** Tracks initial farm capital, logs operational expenses (feed, fingerlings, labor), records harvest revenues, and calculates post-harvest ROI per batch.
> 📸 *Place your screenshot here:*
> `![Financials & Budget](./screenshots/financials.png)`

### 10. 🛒 Consumer Marketplace
A built-in B2C/B2B marketplace bridging the gap between farmers and buyers.
* **Capabilities:** Farmers list harvest-ready batches. Consumers browse via GPS maps, view farm ratings, and submit purchase requests. Features instant farmer replies with pickup coordinates.
> 📸 *Place your screenshot here:*
> `![Marketplace](./screenshots/marketplace.png)`

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons, Leaflet Maps
* **Backend:** Node.js, Express.js
* **Database:** Microsoft SQL Server (MSSQL) using `msnodesqlv8`
* **Authentication:** JWT (JSON Web Tokens)

---

## 🚀 Setup & Installation

### 1. Database Setup
Ensure you have Microsoft SQL Server installed with a database named `FishFarmDB`.
Configure the backend `.env` file with your SQL Server credentials.

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```
*The backend will run on `http://localhost:5000`*

### 3. Frontend Setup
```bash
cd fish-farming-guide
npm install
npm run dev
```
*The frontend will run on `http://localhost:3000`*

---
*Documented with ❤️ by the Fish Farming Guide Team.*
