# Samadhan AI — Hyperlocal Community Problem Solver

Samadhan AI helps residents report local civic problems with a photo and a map location. Gemini classifies the issue, Cloudinary stores the image, PostgreSQL tracks each report, and municipal administrators manage resolution using a protected Spring Security API.

## Project structure

```text
samadhan-ai/
├── frontend/                 # HTML entry point, React, JavaScript, Tailwind, Vite
│   ├── public/
│   ├── screenshots/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Java 21 / Spring Boot API and PostgreSQL setup
│   ├── src/main/java/
│   ├── src/test/java/
│   ├── pom.xml
│   ├── Dockerfile
│   └── compose.yaml
├── .github/                  # GitHub Actions workflow definitions
├── .gitignore
└── README.md
```

All application source and build configuration lives under `frontend/` or `backend/`. `.github/` stays at the repository root because GitHub requires workflow files at `.github/workflows/`.

## Technology

- **Frontend:** React 19, Vite, Tailwind CSS, Leaflet / OpenStreetMap
- **Backend:** Java 21, Spring Boot 3, Spring Security, JWT, Spring Data JPA
- **Database:** PostgreSQL
- **Integrations:** Google Gemini, Cloudinary, OpenStreetMap Nominatim

The user interface remains a React application. Authentication, issue processing, persistence, and integrations run through the Java API; browser code contains no database or vendor API credentials.

## Features

- Anonymous or signed-in civic report submission with image, location, and AI classification.
- Email/password accounts with BCrypt password hashing and signed JWT access tokens.
- Private “My Reports” view for signed-in users and public issue map.
- PostgreSQL report lifecycle: Reported, Under Review, In Progress, and Resolved.
- Admin-only status changes and report deletion, enforced by Spring Security roles.
- Server-side image upload to Cloudinary (with persistent local storage fallback), Gemini vision analysis, and Nominatim reverse geocoding.

## Architecture

```text
React / Leaflet ── REST + JWT ──> Spring Boot API (Java 21)
                                      ├── Spring Security / JWT
                                      ├── Spring Data JPA ──> PostgreSQL
                                      ├── Gemini API
                                      ├── Cloudinary
                                      └── Nominatim
```

Public API routes expose only public report fields; reporter email addresses are not returned in report payloads. User-specific report queries require authentication, and administrative mutations require the `ADMIN` role. The initial admin account is provisioned from server-only environment variables at startup; public registration always creates a regular user.

## Local development

### Requirements

- Java 21
- Maven 3.9+
- Node.js 20+
- Docker Desktop (for local PostgreSQL via Compose)
- Gemini and Cloudinary credentials for AI classification and image uploads

### 1. Configure the API

The real backend configuration file is `backend/.env`. It already contains a securely generated JWT signing key. Edit that file to set your Gemini and Cloudinary credentials, and optionally set the initial admin email/password before starting the API. Do not share or commit either `.env` file.

Set `GEMINI_API_KEY` and all three Cloudinary credentials for the full report workflow. Backend credentials belong only in `backend/.env` or the backend hosting provider’s secret manager; never prefix them with `VITE_`.
Cloudinary credentials are optional for local use: without them or if Cloudinary is unavailable, images are validated and saved to the persistent `samadhan-uploads` Docker volume. For non-Docker deployments, configure `IMAGE_UPLOAD_DIR` on persistent storage. Gemini is also optional for report submission; when analysis is unavailable, the report is still saved and clearly marked for manual review. Add a Gemini key to enable automatic classification.

### 2. Start PostgreSQL and the Spring API

```powershell
docker compose -f backend/compose.yaml up --build
```

The API starts at `http://localhost:8080` after PostgreSQL is healthy. Check it with:

```powershell
Invoke-RestMethod http://localhost:8080/api/health
```

Alternatively, start PostgreSQL separately and run the backend from `backend/`:

```powershell
Set-Location backend
mvn spring-boot:run
```

Direct Maven runs use environment variables from the current shell/IDE; unlike Docker Compose, Maven does not automatically read `backend/.env`. Spring Boot creates/updates the local schema through JPA. For production, use a managed PostgreSQL database and configure the connection with `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD`.

### 3. Start the React frontend

The frontend configuration file is `frontend/.env`; its `VITE_API_URL` can remain empty for local Vite development, which proxies requests to the backend.

```powershell
Set-Location frontend
npm ci
npm run dev
```

Vite proxies `/api` requests to `http://localhost:8080`. The frontend is available at `http://localhost:5173`.

### 4. Checks

```powershell
Set-Location frontend
npm run lint
npm test
npm run build
```

Run frontend checks from `frontend/`. Run backend tests and package the API from `backend/`:

```powershell
mvn test
mvn package
```

## REST API

| Method | Route | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create a standard user account and receive a JWT |
| `POST` | `/api/auth/login` | Public | Authenticate and receive a JWT |
| `GET` | `/api/auth/me` | Signed in | Return the current account and role |
| `GET` | `/api/reports` | Public | List public report data |
| `GET` | `/api/reports/statistics` | Public | Report status counts |
| `GET` | `/api/reports/mine` | Signed in | List reports submitted by the current account |
| `POST` | `/api/reports` | Public / optional JWT | Create an issue report |
| `PATCH` | `/api/reports/{id}/status` | Admin | Update a report status |
| `DELETE` | `/api/reports/{id}` | Admin | Delete a report |
| `POST` | `/api/ai/analyze-issue` | Public | Analyze a base64 image using Gemini |
| `POST` | `/api/images` | Public | Upload an image to Cloudinary (`multipart/form-data`, field `file`) |
| `GET` | `/api/geocode?lat={lat}&lng={lng}` | Public | Reverse geocode coordinates |
| `GET` | `/api/health` | Public | API liveness check |

Send authenticated requests with `Authorization: Bearer <token>`. Report and admin actions are re-checked on the server; client-side role state is only for interface display.

## Configuration reference

### Frontend

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` in `frontend/.env` | No | Base URL for the Spring API; empty/same-origin by default |

### Backend

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` in `backend/.env` | Yes | Base64-encoded signing key with at least 256 bits |
| `DATABASE_URL` | No | JDBC URL; local PostgreSQL default is `jdbc:postgresql://localhost:5432/samadhan` |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | No | Database credentials |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | No | Initial admin account; password must be 12+ characters and no more than 72 UTF-8 bytes |
| `GEMINI_API_KEY` | Needed for analysis | Google AI API key |
| `GEMINI_MODEL` | No | Gemini model; defaults to `gemini-2.5-flash` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Needed for uploads | Private Cloudinary credentials |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated browser origins allowed by the API |
| `PORT` | No | API port; defaults to `8080` |

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env` before the first API startup if the deployment needs an admin account. The API creates that account once; public registration never grants the admin role. Configure a new database or perform a controlled administrative migration before changing the provisioned admin identity.

## Deployment

Deploy the React `dist/` bundle to any static host and deploy the `backend/` Spring Boot container/JAR to a Java-capable host. Provision PostgreSQL separately, configure the backend variables in the host’s secret manager, set `VITE_API_URL` to the API’s HTTPS base URL when building the frontend, and allow the frontend origin in `CORS_ALLOWED_ORIGINS`. Vercel can host the static frontend; the Java API must be deployed as a separate service.

## Data migration note

The Java backend starts with a new PostgreSQL database. Existing Firebase users and issue reports are not copied automatically; export and migrate them separately before retiring the former Firebase deployment.
