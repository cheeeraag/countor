# 🧠 Countor — Mental Wellness Check-in App

A full-stack React app that uses the Claude AI API to conduct conversational mental wellness check-ins, score users, and recommend personalised self-care actions and therapy platforms.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 Auth | Sign up / log in with email & password (localStorage) |
| 🧠 AI Check-in | 10-question conversational check-in powered by Claude API |
| 📊 Wellness Score | 0–100 score with 5-tier classification |
| 🎯 Personalised Recs | Score-based action suggestions + platform recommendations |
| 📈 Dashboard | Daily score card, area trend chart (7D/30D/90D), recent history |
| 🔥 Streaks & Badges | Daily check-in streaks, 8 achievement badges, 12-week heatmap |
| 👩‍⚕️ Therapist Directory | Filterable directory of 8 sample RCI-licensed therapists |
| ⚙️ Admin Dashboard | User stats, tier distribution chart, per-user & bulk CSV export |
| 🆘 Crisis Support | iCall helpline shown for stage 2 scores |

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

> **Note:** The Anthropic API is called directly from the browser. In production, you should proxy this through your own backend to protect your API key. See the "Production Setup" section below.

### 3. Build for production

```bash
npm run build
```

---

## 📁 Project Structure

```
countor/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx                  # Entry point
│   ├── App.jsx                   # Root + page routing
│   ├── context/
│   │   └── AppContext.jsx        # Global auth + history state
│   ├── utils/
│   │   ├── api.js                # Claude API helper + system prompt
│   │   └── storage.js            # localStorage wrapper + CSV export
│   ├── data/
│   │   └── recommendations.js    # Tiers, recs, therapists, badges
│   ├── styles/
│   │   └── global.css            # Design tokens + utility classes
│   └── components/
│       ├── UI.jsx                # Shared: ScoreCircle, Avatar, etc.
│       ├── TopNav.jsx            # Navigation bar
│       ├── AuthScreen.jsx        # Login / Sign up
│       ├── Dashboard.jsx         # Main dashboard + trend chart
│       ├── ChatScreen.jsx        # AI check-in conversation
│       ├── ResultsScreen.jsx     # Score results + recommendations
│       ├── TherapistDirectory.jsx# Filterable therapist list
│       ├── StreaksPage.jsx        # Gamification + heatmap
│       └── AdminPage.jsx         # Admin stats + CSV export
```

---

## 🔑 API Key Setup

The app calls the Anthropic API from `src/utils/api.js`. The Claude.ai environment injects the API key automatically when running inside Claude artifacts.

**For standalone deployment**, create a backend proxy:

```js
// Example: Express.js proxy (backend/server.js)
app.post('/api/chat', async (req, res) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(req.body),
  })
  const data = await response.json()
  res.json(data)
})
```

Then update `src/utils/api.js` to point to `/api/chat` instead of the Anthropic endpoint directly.

---

## 🎯 Score → Tier Mapping

| Score | Tier | Approach |
|---|---|---|
| 70–100 | 🌿 Healthy | Content & Self-Management |
| 50–69 | 🌤 Moderate | Content & Light Support |
| 35–49 | 🌧 Needs Care | Therapy / Counselling |
| 15–34 | ⛈ Seek Help | Diagnosis + Early Intervention |
| 0–14 | 🆘 Urgent Care | Immediate Professional Care |

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Styling | CSS custom properties (no framework) |
| Charts | Recharts |
| AI | Anthropic Claude claude-sonnet-4-20250514 |
| Storage | localStorage (upgrade to Firebase/Supabase for production) |
| Auth | Custom (upgrade to Clerk/Auth0 for production) |

---

## 🏭 Production Checklist

- [ ] Move API calls to a backend proxy (never expose API key in frontend)
- [ ] Replace localStorage with a real database (Firebase, Supabase, PostgreSQL)
- [ ] Add proper authentication (Clerk, Auth0, or Supabase Auth)
- [ ] Add rate limiting on check-ins (e.g., max 3 per day)
- [ ] Add GDPR/data consent banner
- [ ] Review content with a licensed mental health professional
- [ ] Add proper crisis escalation flow for stage2 users
- [ ] Set up error monitoring (Sentry)

---

## ⚠️ Disclaimer

Countor is a wellness check-in tool and is **not a medical device**. It does not provide diagnosis, treatment, or clinical advice. Users experiencing a mental health crisis should contact a professional immediately.

**iCall (India, free & confidential): 9152987821** — Mon–Sat, 9am–10pm

---

## 📄 License

MIT — built with ❤️ for accessible mental wellness in India.
