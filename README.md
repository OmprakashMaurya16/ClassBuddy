# ClassEcho

Smart Continuous Faculty Performance Evaluation System built with a MERN stack backend + React frontend, with an optional ML microservice (Flask + Transformers) to derive feedback sentiment.

The core workflow is:

- Faculty generates a time-bound QR session for a subject
- Students open the feedback form via the QR link and submit ratings + an optional remark
- Backend stores feedback and computes sentiment (via the ML service when available; falls back to rating-based sentiment when not)
- Faculty/HOD/Admin view analytics and dashboards

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)

## Installation & Setup

### Prerequisites

- Node.js (LTS recommended)
- npm
- Python 3.10+ (for the ML service)
- A MongoDB database (local or hosted)

### 1) Backend setup (Express + MongoDB)

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGO_URI=mongodb://localhost:27017/classecho

# Auth
JWT_SECRET=replace-me
JWT_REFRESH_SECRET=replace-me-too
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email (used by Forgot Password flow)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
MAILTRAP_USERNAME=replace-me
MAILTRAP_PASSWORD=replace-me
EMAIL_FROM=no-reply@classbuddy.local

# ML sentiment service (optional)
ML_SERVICE_URL=http://127.0.0.1:3000/api/feedback
ML_SERVICE_TIMEOUT_MS=4000
```

Run the backend:

```bash
npm run dev
```

Optional seed script:

```bash
npm run seed
```

### 2) Frontend setup (React + Vite)

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
# Backend base URL
VITE_API_URL=http://localhost:5000
```

Run the frontend:

```bash
npm run dev
```

### 3) ML service setup (Flask + Transformers) — optional

The backend can call an ML microservice for sentiment classification. If the ML service is down/unreachable, the backend automatically falls back to rating-based sentiment.

```bash
cd "../ml model"
python -m venv .venv

# Windows (Git Bash)
source .venv/Scripts/activate

pip install -r requirements.txt
```

Create `ml model/.env` (optional):

```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=classecho
SECRET_KEY=dev-secret-key
```

Run the ML service:

```bash
python app.py
```

By default it starts on port `3000` (see `ml model/app.py`).

## Usage

### Start the full system (local)

1. Start MongoDB (local service or Atlas)
2. Start ML service (optional):
   - `cd "ml model" && source .venv/Scripts/activate && python app.py`
3. Start backend:
   - `cd backend && npm run dev`
4. Start frontend:
   - `cd frontend && npm run dev`

### Typical user flows

- **Admin**: manage faculty users, assign subjects, view admin stats
- **Faculty**: manage sessions (generate QR, view sessions list), view analytics and timeline
- **HOD**: department dashboard + view analytics/timeline for faculty in department
- **Student**: open feedback form from QR link and submit feedback for an active session

## Project Structure

```
ClassEcho/
  backend/                 # Express API + MongoDB models
    src/
      config/              # DB + email config
      controllers/         # Route handlers
      middlewares/         # Auth + role-based access
      models/              # Mongoose models
      routes/              # Express routes (REST)
      scripts/             # Seed + helpers
      utils/               # Common utilities (errors, tokens, ML client)

  frontend/                # React + Vite web app
    src/
      auth/                # Auth context + protected routes
      components/          # Reusable UI components
      pages/               # App pages (dashboards, forms)
      utils/               # Axios client + helpers

  ml model/                # Flask microservice for sentiment + charts
    templates/             # HTML pages (stats)
    static/                # CSS/JS for the Flask UI
```

## Features

- Role-based authentication and authorization (Admin / HOD / Faculty)
- JWT access tokens + refresh tokens (refresh token stored as an httpOnly cookie)
- Faculty QR session generation with expiration
- Student feedback submission with duplicate prevention per roll number per session
- Sentiment classification:
  - Primary: ML service (BERT sentiment pipeline)
  - Fallback: rating-based sentiment bands
- Faculty analytics and timeline endpoints
- HOD dashboard and per-faculty analytics access

## Technologies Used

**Backend**

- Node.js, Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`), password hashing (`bcryptjs`)
- CORS, cookies (`cookie-parser`)
- QR generation (`qrcode`)
- Email via SMTP (`nodemailer`)

**Frontend**

- React + Vite
- Tailwind CSS
- Axios
- Chart.js
- React Router

**ML service**

- Flask
- Transformers (`nlptown/bert-base-multilingual-uncased-sentiment` pipeline)
- PyTorch (optional, for running the BERT pipeline)
- PyMongo

## API Documentation

### Base URLs

- Backend (Express): `http://localhost:5000`
- ML service (Flask, optional): `http://localhost:3000`

### Auth

- Protected backend routes require an **access token**:
  - Header: `Authorization: Bearer <accessToken>`
- Refresh token is stored as a cookie named `refreshToken`.

### Backend routes

Mounted in `backend/src/app.js`.

#### Auth (`/api/auth`)

- `POST /api/auth/login`
  - Body: `{ "email": "...", "password": "..." }`
- `POST /api/auth/logout` (auth required)
- `POST /api/auth/refresh-token` (uses cookie)
- `POST /api/auth/forgot-password`
  - Body: `{ "email": "..." }`
- `POST /api/auth/verify-reset-otp`
  - Body: `{ "email": "...", "otp": "123456" }`
- `POST /api/auth/reset-password`
  - Body: `{ "email": "...", "newPassword": "...", "confirmPassword": "..." }`

#### Subjects (`/api/subjects`)

- `POST /api/subjects/add/:userId` (Admin)
- `GET /api/subjects/mine` (Faculty)
- `GET /api/subjects/faculty/:facultyId` (HOD)

#### Admin (`/api/admin`) — Admin only

- `GET /api/admin/stats`
- `GET /api/admin/faculty`
- `POST /api/admin/faculty`
- `PUT /api/admin/faculty/:facultyId`
- `DELETE /api/admin/faculty/:facultyId`
- `POST /api/admin/faculty/:facultyId/subjects`
- `PUT /api/admin/subjects/:subjectId`
- `DELETE /api/admin/subjects/:subjectId`

#### Sessions (`/api/sessions`)

- `POST /api/sessions/generate` (Faculty)
  - Body: `{ "subjectId": "...", "date": "2026-04-03" }` (date optional)
  - Returns: `qrDataUrl` + `feedbackUrl` + expiration
- `GET /api/sessions/mine?limit=10` (Faculty)
- `GET /api/sessions/:token` (public) — validates QR token before feedback
- `PATCH /api/sessions/:sessionId/close` (Faculty)
- `DELETE /api/sessions/:sessionId` (Faculty) — only for active & non-expired sessions

#### Feedback (`/api/feedback`)

- `POST /api/feedback/submit` (public)
  - Body:
    ```json
    {
      "token": "<qrToken>",
      "studentName": "...",
      "rollNo": "...",
      "rating": {
        "conceptClarity": 1,
        "lectureStructure": 1,
        "subjectMastery": 1,
        "practicalUnderstanding": 1,
        "studentEngagement": 1,
        "lecturePace": 1,
        "learningOutcomeImpact": 1
      },
      "remark": "optional"
    }
    ```

#### Analytics (`/api/analytics/faculty`)

- `GET /api/analytics/faculty/` (Faculty)
- `GET /api/analytics/faculty/timeline` (Faculty)
- `GET /api/analytics/faculty/:id/analytics` (HOD)
- `GET /api/analytics/faculty/:id/timeline` (HOD)

#### HOD (`/api/hod`)

- `GET /api/hod/dashboard` (HOD)

### ML service routes (optional)

Provided by `ml model/app.py`.

- `POST /api/feedback`
  - Accepts: `{ studentName, rollNo, sessionId, ratings, remark }`
  - Returns: `{ averageRating, sentiment, sentimentScore, sentimentSource }`
- `GET /api/feedback/stats?sessionId=...`
- `GET /api/feedback/list?sessionId=...`
- `GET /api/status`

## Testing

### Backend

This repo currently does not include an automated test suite. The `backend/package.json` `test` script is a placeholder.

### Frontend

Run lint:

```bash
cd frontend
npm run lint
```

### ML service

A helper script exists to submit sample feedbacks:

```bash
cd "ml model"
python test_submissions.py
```

Note: `ml model/test_submissions.py` targets `http://127.0.0.1:5000` by default, while `ml model/app.py` starts on port `3000`. Update the script’s `BASE_URL` or run the Flask app on the expected port.

## Deployment

### Frontend

- Configure `VITE_API_URL` to point to the deployed backend.
- Build:
  ```bash
  cd frontend
  npm run build
  ```
- Deploy the `dist/` output (Vercel is commonly used for Vite apps).

### Backend

- Ensure environment variables from `backend/.env` are set in your hosting provider.
- Set `FRONTEND_URL` to your deployed frontend origin to satisfy CORS.
- Ensure MongoDB is reachable from the backend.
- If deploying the ML service, set `ML_SERVICE_URL` to its public URL.

### ML service (optional)

- Install Python deps from `ml model/requirements.txt`.
- Provide `MONGO_URI` / `DB_NAME` if you want persistence for the ML service’s own stats pages.
- Expose the service and set backend `ML_SERVICE_URL` accordingly.

Render notes:

- This repo includes `.python-version` to pin Python to `3.12` (avoids source builds for `tokenizers`).
- Recommended start command: `gunicorn app:app` (set Render Root Directory to `ml model`).
