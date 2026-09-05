# 🧠 Countor v4 — Full Stack Mental Wellness Platform

React + Vite frontend with a Node.js + Express + PostgreSQL backend.

## Product architecture

Countor uses a two-dimensional **Wellness × Distress** framework. Users can complete a structured 30-item check-in or a voice-first free-form check-in. Voice responses are transcribed and then estimated against the same 30 dimensions; the result is an estimate from unstructured language, not an actual administration of a validated questionnaire and not a diagnosis.

Personalized resources are selected using Euclidean distance from the user's latest normalized position to platform anchors.

### Privacy-first organization model

- Individual users see their own history, position and recommendations.
- Organization dashboards show aggregate wellness, distress and engagement only.
- Organization admins do not receive employee names beside individual scores or individual risk labels.
- Each member has a persistent display identity in the form **`CNT-XXXXXXXXXX`** (10 digits). The database user ID remains a UUID and the display code is not a security credential.
- Department visibility is opt-in during organization onboarding and can be changed later from Profile → Privacy.
- Support requests use the Countor Member ID for pseudonymous communication rather than attaching a wellness score to an identity.
- Safety signals remain aggregate in organization analytics and are not presented as an employee risk list.

## Project structure

```
countor/
├── backend/          ← Express REST API
└── frontend/         ← React + Vite app
```

## Quick setup

### Database

Run `backend/db/schema.sql` against PostgreSQL. The application also safely ensures the privacy/support additions exist at runtime for existing deployments.

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Required environment variables include `DATABASE_URL`, `JWT_SECRET`, `SUPERADMIN_EMAIL`, and `FRONTEND_URL`. `GEMINI_API_KEY` is required for voice check-ins; `GEMINI_MODEL` defaults to `gemini-3.6-flash`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Set `VITE_API_URL` to the deployed backend URL and `VITE_SUPERADMIN_EMAIL` to the same superadmin email.

## API reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Register member / organization request |
| POST | `/api/auth/login` | — | Login and return JWT |
| GET | `/api/auth/me` | JWT | Current user and privacy metadata |
| GET | `/api/orgs/approved` | — | Approved organization selector |
| GET | `/api/orgs` | superadmin | Organization overview |
| PUT | `/api/orgs/:id/approve` | superadmin | Approve organization |
| PUT | `/api/orgs/:id/reject` | superadmin | Reject organization |
| POST | `/api/checkins` | user | Save today's questionnaire or voice check-in |
| GET | `/api/checkins` | user | Current user's history |
| GET | `/api/checkins/recommendations` | user | Latest Euclidean resource matches |
| GET | `/api/privacy` | — | — |
| PUT | `/api/privacy` | user | Update department directory visibility |
| GET | `/api/support` | user | User support requests |
| POST | `/api/support` | user | Request support |
| POST | `/api/support/:id/messages` | user | Message a support request |
| GET | `/api/admin/stats` | admin | Aggregate platform/org analytics |
| GET | `/api/admin/users` | admin | Privacy-safe engagement summary |
| GET | `/api/admin/support` | admin | Pseudonymous support queue |
| POST | `/api/admin/support/:id/messages` | admin | Send supportive message |
| GET | `/api/admin/export` | admin | Aggregate CSV export |
| GET | `/api/posts` | optional | Community feed |
| POST | `/api/posts` | user | Create community post |

## Roles

| Role | Access |
|---|---|
| `user` | Dashboard, check-in, community, therapists, streaks, support |
| `org_admin` | Member experience + aggregate organization analytics + support workflow |
| `superadmin` | Platform overview, organization management, aggregate analytics and support workflow |
| `org_admin_pending` | Waiting room until organization approval |
| `rejected` | Rejection state |

## Voice check-in

The voice flow is intentionally frictionless: record → Gemini transcription → Gemini structured 30-item estimation → Countor calculates the Wellness × Distress scores → Euclidean resource matching. The backend allows up to 180 seconds for each Gemini operation and retries transient connection/timeout failures.

The UI uses a voice orb rather than a microphone emoji, recommends about 60 seconds without making it a task, supports English/Hindi prompts, and clearly communicates that the result is an estimate.

## Disclaimer

Countor is a screening and wellness-support product, not a medical device or diagnostic service. Crisis support and safety escalation should use a dedicated safety protocol rather than relying on the dashboard risk labels.
