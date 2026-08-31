# 🚀 Samadhan AI

<div align="center">

### 🤖 AI-Powered Hyperlocal Civic Problem Solving Platform

Built for **Coding Ninjas × Google AI Hackathon 2026**

[![React](https://img.shields.io/badge/React-19-blue?logo=react)]()
[![Vite](https://img.shields.io/badge/Vite-Latest-purple?logo=vite)]()
[![Firebase](https://img.shields.io/badge/Firebase-Authentication_%26_Firestore-orange?logo=firebase)]()
[![Gemini AI](https://img.shields.io/badge/Google-Gemini_2.5_Flash-blue?logo=google)]()
[![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN_Image_Storage-blue)]()
[![License](https://img.shields.io/badge/License-MIT-green)]()

🌐 **Live Demo**  
https://samadhan-ai-rho.vercel.app

💻 **GitHub Repository**  
https://github.com/khuman-dhakad/samadhan-ai

</div>

---

## 📖 Overview

**Samadhan AI** is an AI-powered hyperlocal civic issue reporting and triage platform that enables citizens to report public infrastructure defects using image analysis, GPS location intelligence, and automated municipal department routing.

Citizens upload an image and pin the location on a live Leaflet map. **Google Gemini AI** automatically categorizes the issue, calculates severity, risk level, confidence score, and assigns the responsible municipal department (Public Works, Sanitation, Water Supply, Electricity Board). Reports are persisted in Cloud Firestore for transparent community tracking and administrative resolution.

---

## ✨ Key Capabilities

- 🤖 **Multimodal AI Analysis**: Zero-shot civic issue classification and severity detection using Google Gemini 2.5 Flash.
- 📍 **Hyperlocal Geotagging**: Interactive OpenStreetMap coordinate picker with reverse geocoding to human-readable street addresses.
- 🗺 **Community Issue Map**: Real-time map view with priority-based color coding (High, Medium, Low) and priority filtering.
- 🔐 **Firebase Authentication**: Seamless Google OAuth login and persistent user session management.
- ☁ **Cloudinary CDN Image Pipeline**: Automatic image optimization, secure upload, and persistent CDN hosting.
- 🔥 **Cloud Firestore Database**: Real-time storage with deterministic sorting, status updates, and statistics.
- 📋 **Citizen Report Tracking**: Personalized "My Reports" portal with real-time status tracking (Reported, Under Review, In Progress, Resolved).
- 👑 **Admin Command Center**: Role-based triage dashboard for municipal officers with search, status transitions, full-resolution inspection, and record management.
- 📱 **Mobile-First Responsive UX**: Optimized for mobile, tablet, and desktop viewports with accessible controls.
- 🛡️ **Production Hardened**: Resilient AI JSON sanitization, image file validation, memory leak prevention, and ErrorBoundary protection.

---

## 🏗 System Architecture

```text
                        Citizen / User
                              │
                              ▼
                  Google OAuth Authentication
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
    Capture / Upload Image              Pin Location on Map
            │                                   │
            ▼                                   ▼
  Cloudinary CDN Upload                 Reverse Geocoding
  (Secure Image URL)                    (Street Address)
            │                                   │
            └─────────────────┬─────────────────┘
                              ▼
                   Google Gemini 2.5 Flash
                   (Multimodal AI Analysis)
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
    Category & Severity                Department & Priority
            │                                   │
            └─────────────────┬─────────────────┘
                              ▼
                  Save to Cloud Firestore
                  (Status: "Reported")
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
     Community Map       My Reports      Admin Dashboard
     (Live Pins)        (User Portal)     (Triage & Ops)
```

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, Vite 8 |
| **Styling & Design** | Tailwind CSS v4 |
| **Routing** | React Router v7 |
| **AI / ML** | Google Gen AI SDK (`@google/genai`), Gemini 2.5 Flash |
| **Maps & GIS** | React Leaflet 5, Leaflet 1.9, OpenStreetMap, Nominatim API |
| **Authentication** | Firebase Authentication (Google OAuth Provider) |
| **Database** | Cloud Firestore |
| **Media Storage** | Cloudinary Image Upload API |
| **Deployment** | Vercel (with SPA rewrites configuration) |

---

## 📂 Project Structure

```text
samadhan-ai
├── public
│   ├── _redirects            # SPA redirect rule for static hosts
│   ├── favicon.svg
│   └── icons.svg
├── src
│   ├── assets
│   │   ├── hero.png
│   │   └── markers           # Leaflet pin icons (red, yellow, violet, grey, selected)
│   ├── components
│   │   ├── AdminDashboard    # Municipal triage dashboard
│   │   ├── ErrorBoundary     # Graceful error catching
│   │   ├── MapView           # Leaflet interactive map component
│   │   ├── MyReports         # User report card grid
│   │   └── Navbar            # Responsive header with live auth state
│   ├── pages
│   │   ├── Admin             # Admin route
│   │   ├── CommunityMap      # Community map route with filters
│   │   ├── Home              # Landing page with hero, workflow & stats
│   │   ├── MyReports         # User tracking portal
│   │   └── ReportIssue       # Issue reporting workflow with Gemini & Cloudinary
│   ├── services
│   │   ├── cloudinary        # Cloudinary upload service
│   │   ├── firebase          # Firebase App, Auth, and Firestore services
│   │   ├── gemini            # Gemini multimodal AI service & JSON sanitizer
│   │   └── map               # Nominatim reverse geocoding
│   ├── utils
│   │   └── fileToBase64.js   # Base64 file converter
│   ├── App.jsx               # Route definitions and footer
│   ├── index.css             # Tailwind CSS & global styles
│   └── main.jsx              # React root entrypoint
├── firestore.rules           # Declarative Firestore security rules
├── vercel.json               # Vercel SPA routing rewrites
├── .env.example              # Environment variable template
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/khuman-dhakad/samadhan-ai.git
cd samadhan-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Gemini API
VITE_GEMINI_API_KEY=your_gemini_api_key

# Cloudinary Storage
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset

# Admin Dashboard Access (Optional comma-separated list of emails)
VITE_ADMIN_EMAILS=admin@samadhan.ai,your-email@gmail.com
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

---

## 🔐 Security & Database Rules

Production Firestore Security Rules are provided in [`firestore.rules`](./firestore.rules):
- **Read Access**: Open for public community issue tracking.
- **Write Access**: Allowed for valid report schemas with required fields.
- **Admin & Mutations**: Restricted to authenticated users and authorized roles.

---

## 👨‍💻 Developer

**Khuman Dhakad**
MCA Student • Full Stack Developer • AI Enthusiast
- [GitHub Profile](https://github.com/khuman-dhakad)
- [LinkedIn Profile](https://linkedin.com/in/khuman-dhakad)

---

<div align="center">

### ⭐ Built for Coding Ninjas × Google AI Hackathon 2026

</div>