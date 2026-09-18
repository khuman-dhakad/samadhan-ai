# 🏛️ Samadhan AI — Hyperlocal Civic Intelligence Platform

An AI-powered civic issue reporting and triage platform that enables citizens to document, geotag, and track municipal infrastructure defects, while providing authorities with automated multimodal triage and role-based resolution tools.

[![CI Status](https://github.com/khuman-dhakad/samadhan-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/khuman-dhakad/samadhan-ai/actions)
[![React 19](https://img.shields.io/badge/React-19.2-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8.0-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%26_Firestore-ffca28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Gemini 2.5 Flash](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_Pipeline-3448c5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Security & RBAC Model](#-security--rbac-model)
- [API Reference](#-api-reference)
- [Local Setup & Development](#-local-setup--development)
- [Environment Variables](#-environment-variables)
- [Firebase & Firestore Setup](#-firebase--firestore-setup)
- [Admin Custom Claim Configuration](#-admin-custom-claim-configuration)
- [Vercel Deployment](#-vercel-deployment)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Engineering Highlights](#-engineering-highlights)
- [Troubleshooting Guide](#-troubleshooting-guide)

---

## 🔍 Overview

Municipal authorities struggle with decentralized, poorly categorized, and unverified citizen complaint channels. **Samadhan AI** bridges this gap:

Citizens upload an image and select the location on a live Leaflet map. **Google Gemini AI** automatically categorizes the issue, calculates severity, risk level, confidence score, and assigns the responsible municipal department (Public Works, Sanitation, Water Supply, Electricity Board). Reports are persisted in Cloud Firestore for transparent community tracking and administrative resolution.

---

## ✨ Key Features

- **Multimodal AI Issue Classification**: Analyzes infrastructure photographs using Google Gemini 2.5 Flash through server-side serverless functions without exposing API secrets in browser bundles.
- **Hyperlocal Geotagging**: Interactive Leaflet map with reverse geocoding to human-readable street addresses via rate-limit compliant backend proxying.
- **Community Hotspot Map**: Real-time visual tracker color-coded by urgency (`High`, `Medium`, `Low`) with instant client-side priority filtering.
- **Centralized Authentication & RBAC**: Google OAuth with unified single-observer state management and cryptographic Firebase custom claims (`token.admin == true`) for administrative operations.
- **PII Isolation & Data Privacy**: Public community map feeds strictly exclude citizen email addresses and phone numbers. Author contact details are sequestered in protected subcollections accessible only by the reporter or verified administrators.
- **Cloud Media Pipeline**: Secure client-to-CDN image uploads via Cloudinary with client-side MIME and size validation (max 10MB).
- **Personalized Tracking Portal**: Dedicated "My Reports" portal displaying real-time lifecycle status of citizen submissions.
- **Administrative Command Center**: Comprehensive triage suite with full-resolution inspection lightbox, search, filter, status lifecycle transitions, and record deletion.
- **Production Resilience**: Defensive AI JSON sanitization, submission race-condition guards, memory leak prevention via Object URL revocation, and React ErrorBoundary wrapper.

---

## 🏗 System Architecture

```text
                                [ Citizen / User ]
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
                 [ Google OAuth ]             [ Guest Reporting ]
                 (AuthContext.jsx)             (Anonymous UID)
                         │                             │
                         └──────────────┬──────────────┘
                                        ▼
               ┌─────────────────────────────────────────────────┐
               │              React 19 SPA Frontend              │
               │   (ReportIssue, CommunityMap, AdminDashboard)   │
               └────────┬──────────────────────┬─────────────────┘
                        │                      │
       Image File (<=10MB)                     │ Base64 Image
                        ▼                      ▼
           [ Cloudinary Upload API ]    [ /api/analyze-issue ]
           (HTTPS Unsigned Preset)      (Vercel Serverless / Node)
                        │                      │
                        │                      │ process.env.GEMINI_API_KEY
                        │                      ▼
                        │             [ Google Gemini 2.5 Flash ]
                        │             (Multimodal Inference)
                        │                      │
                        │ CDN URL              │ Structured AI Schema
                        └──────────────┬───────┘
                                       ▼
                     [ Reverse Geocoding Proxy ]
                     (GET /api/geocode -> Nominatim)
                                       │
                                       ▼
                       [ Cloud Firestore Database ]
           ┌───────────────────────────┴───────────────────────────┐
           ▼                                                       ▼
   /issueReports/{id}                                    /issueReports/{id}/private/meta
   (Public Schema: No PII,                               (Protected Subcollection:
    category, coordinates, status,                        author email & metadata;
    department, image, timestamp)                         Author & Admin read-only)
           │                                                       │
           ├───────────────────────────┬───────────────────────────┤
           ▼                           ▼                           ▼
    [ Community Map ]           [ My Reports ]            [ Admin Dashboard ]
     Public Live Pins          Author's Tracker          RBAC Custom Claim Guard
```

---

## 🛠 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19.2, Vite 8.0 | High-performance Single Page Application (SPA) |
| **Styling** | Tailwind CSS v4.3 | Responsive utility-first design with native dark theme |
| **Routing** | React Router DOM v7.1 | Declarative client-side routing with SPA rewrite support |
| **Backend & Serverless**| Vercel Serverless Functions | Secure server-side proxying for Gemini AI & Geocoding |
| **AI / Machine Learning**| Google Gen AI SDK (`@google/genai`) | Gemini 2.5 Flash multimodal vision inference |
| **GIS & Mapping** | Leaflet 1.9, React Leaflet 5.0 | Interactive coordinate picker and clustered community maps |
| **Geocoding** | OpenStreetMap Nominatim | Reverse geocoding via rate-limited backend proxy |
| **Database** | Cloud Firestore | Real-time NoSQL storage with declarative security rules |
| **Authentication** | Firebase Authentication | Google OAuth 2.0 with custom claims RBAC |
| **Media Hosting** | Cloudinary REST API | Scalable image optimization and CDN delivery |
| **Testing** | Vitest 5.0 | Automated unit testing for AI parsing, schemas, and RBAC |
| **CI / CD** | GitHub Actions | Automated pipeline running `lint`, `test`, and `build` |

---

## 🔐 Security & RBAC Model

### 1. Server-Side AI Secret Isolation
In development and production, `GEMINI_API_KEY` is loaded exclusively inside server environments (`/api/analyze-issue` and Vite dev server middleware). The client bundle contains **zero** references to Gemini secrets or `@google/genai` libraries, preventing browser extraction.

### 2. Cryptographic Admin Authorization
Client-side email checks (`VITE_ADMIN_EMAILS`) are used purely for local developer preview. The true security boundary is enforced at the database layer in [`firestore.rules`](./firestore.rules):

```firestore
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}

// Only verified administrators can alter report status or delete records
allow update: if isAdmin();
allow delete: if isAdmin();
```

Even if an attacker attempts manual REST/SDK mutations against Firestore, the operation will be rejected with `permission-denied` unless the user's cryptographically signed Firebase ID token contains `{ admin: true }`.

### 3. PII Exclusion & Subcollection Isolation
- **Public Collection** (`/issueReports/{id}`): Contains public fields only (`category`, `severity`, `priority`, `confidence`, `latitude`, `longitude`, `imageUrl`, `department`, `status`). Explicitly prohibits `userEmail` and `phoneNumber`.
- **Private Subcollection** (`/issueReports/{id}/private/meta`): Stores author email. Readable only by the report creator (`request.auth.uid == userId`) or an admin (`request.auth.token.admin == true`).

---

## 📡 API Reference

### 1. Issue Analysis
- **Endpoint**: `POST /api/analyze-issue`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "image": "data:image/jpeg;base64,..."
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "category": "Pothole",
      "severity": "High",
      "confidence": 92,
      "risk": "Vehicular damage and accident hazard",
      "department": "Public Works Department",
      "priority": "High"
    }
  }
  ```
- **Error Codes**:
  - `400 Bad Request`: Missing or malformed image string.
  - `405 Method Not Allowed`: Request method is not POST.
  - `413 Payload Too Large`: Base64 payload exceeds 10MB limit.

### 2. Reverse Geocoding Proxy
- **Endpoint**: `GET /api/geocode?lat={latitude}&lng={longitude}`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "locationName": "Main Street, Ward 12, Bhopal, Madhya Pradesh, India"
  }
  ```
- **Error Codes**:
  - `400 Bad Request`: Latitude or longitude missing or outside `-90..90` / `-180..180`.
  - `405 Method Not Allowed`: Request method is not GET.

---

## 💻 Local Setup & Development

### 1. Prerequisites
- Node.js `v20.x` or `v22.x`
- npm `v10.x` or higher

### 2. Clone & Install
```bash
git clone https://github.com/khuman-dhakad/samadhan-ai.git
cd samadhan-ai
npm ci
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate the values in `.env` (refer to the [Environment Variables](#-environment-variables) section below).

### 4. Run Development Server
```bash
npm run dev
```
The application will start at `http://localhost:5173`. Vite dev-middleware automatically serves `/api/analyze-issue` and `/api/geocode` using your local `GEMINI_API_KEY`.

### 5. Run Quality Checks
```bash
npm run lint    # ESLint verification
npm test        # Vitest automated test suite
npm run build   # Production Vite compilation
```

---

## 🔑 Environment Variables

| Variable | Scope | Required | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Server-Side | Yes | Google Gemini API key for multimodal issue analysis. |
| `VITE_FIREBASE_API_KEY` | Client-Side | Yes | Firebase Web API key. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Client-Side | Yes | Firebase Auth domain (`project.firebaseapp.com`). |
| `VITE_FIREBASE_PROJECT_ID` | Client-Side | Yes | Firebase Project ID. |
| `VITE_FIREBASE_STORAGE_BUCKET` | Client-Side | Yes | Firebase Storage bucket identifier. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Client-Side | Yes | Firebase Cloud Messaging sender ID. |
| `VITE_FIREBASE_APP_ID` | Client-Side | Yes | Firebase Web Application ID. |
| `VITE_CLOUDINARY_CLOUD_NAME` | Client-Side | Yes | Cloudinary Cloud Name for media storage. |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Client-Side | Yes | Unsigned upload preset configured in Cloudinary. |
| `VITE_ADMIN_EMAILS` | Client-Side | Optional | Comma-separated emails for local development UI preview. |

---

## 🔥 Firebase & Firestore Setup

### 1. Enable Firebase Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/) -> **Authentication** -> **Sign-in method**.
2. Enable the **Google** provider.
3. In **Settings** -> **Authorized domains**, ensure your deployment domains are listed (e.g., `localhost`, `samadhan-ai-rho.vercel.app`).

### 2. Deploy Firestore Security Rules
Install Firebase CLI and deploy the rules:
```bash
npm install -g firebase-tools
firebase login
firebase use your-project-id
firebase deploy --only firestore:rules
```

---

## 👑 Admin Custom Claim Configuration

Administrative actions (status updates and report deletion) require the `admin: true` custom claim.

### Using the Provisioning Script:
1. Generate a Service Account Key in Firebase Console (**Project Settings** -> **Service accounts** -> **Generate new private key**).
2. Save it locally (e.g. `serviceAccountKey.json`).
3. Set the environment variable and run the provisioning utility:
   ```bash
   # Linux/macOS
   export GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
   node scripts/set-admin-claim.mjs your-email@example.com

   # Windows PowerShell
   $env:GOOGLE_APPLICATION_CREDENTIALS=".\serviceAccountKey.json"
   node scripts/set-admin-claim.mjs your-email@example.com
   ```
4. Sign out and sign back in to refresh the user's ID token.

---

## 🚀 Vercel Deployment

1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com/).
3. Configure the Project Environment Variables in Vercel Dashboard:
   - `GEMINI_API_KEY` (Serverless secret)
   - All `VITE_*` variables listed in `.env.example`.
4. Deploy. Vercel automatically deploys:
   - Client Single Page Application from `dist/`
   - Serverless Functions from `api/analyze-issue.js` and `api/geocode.js`.
5. Direct navigation to `/`, `/report`, `/map`, `/my-reports`, and `/admin` works out-of-the-box via [`vercel.json`](./vercel.json).

---

## 🧪 Testing & Quality Assurance

Automated unit tests are implemented using **Vitest** in the `tests/` directory:

```bash
npm test
```

### Coverage Areas:
- **`tests/geminiService.test.js`**: Markdown code-fence stripping, truncated JSON recovery, fallback generation, priority and severity normalization.
- **`tests/validation.test.js`**: Coordinate boundary validation (`-90..90`, `-180..180`), file size limits (<= 10MB), MIME verification, and PII leak detection.
- **`tests/authHelper.test.js`**: Token custom claims parsing, admin state determination, and user-facing error formatting.
- **`tests/apiRoutes.test.js`**: HTTP method verification, oversized payload rejection (413), bad request validation (400), and rate-limit fallbacks.

---

## 💡 Engineering Highlights

- **Bundle Optimization**: Stripped `@google/genai` from client-side bundles, reducing initial client JavaScript bundle size by **~320 kB** (~24% reduction).
- **Zero Duplicate Auth Listeners**: Centralized authentication into `AuthContext`, reducing Firebase Auth listeners across Navbar, ReportIssue, MyReports, and AdminDashboard from **4 down to 1**.
- **Defense in Depth**: PII isolation in Firestore rules paired with client-side payload sanitation ensures citizen email addresses can never be leaked to public map scrapers.
- **Resilient Fallback Design**: Automated heuristics ensure that temporary AI API outages or rate limits degrade gracefully into structured municipal triage tickets rather than terminating user workflow.

---

## 🛠 Troubleshooting Guide

| Problem | Cause | Resolution |
|---|---|---|
| **"Firebase is not configured"** | Missing `VITE_FIREBASE_*` variables in `.env`. | Verify that all 6 Firebase variables are present in `.env` and restart the Vite server. |
| **"Sign-in popup was blocked"** | Browser popup blocker prevented OAuth window. | Allow popups for `localhost` or your domain in your browser settings. |
| **"This domain is not authorized"** | Current host is not in Firebase Auth whitelist. | Add your domain to Firebase Console -> Authentication -> Settings -> Authorized domains. |
| **"Permission denied by Firestore"** | Non-admin user attempted status update/deletion. | Assign the admin custom claim using `scripts/set-admin-claim.mjs`. |
| **"Cloudinary is not configured"** | Missing Cloudinary cloud name or unsigned preset. | Configure `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` in `.env`. |
| **"AI analysis timed out"** | Network latency or rate-limiting on Gemini API. | The system automatically applies an offline fallback ticket to avoid losing citizen report data. |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
