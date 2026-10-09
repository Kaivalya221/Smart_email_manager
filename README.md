# 📬 MailMind — Smart Email Management System

AI-powered Gmail inbox with automatic summarization, categorization, and priority detection.

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

The `.env` file in `/backend` is pre-configured with your Google OAuth credentials:

```env
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
REDIRECT_URI=http://localhost:8080/gmail-callback
OPENAI_API_KEY=your_openai_api_key_here   # Optional – falls back to rule-based NLP
PORT=8080
```

> **Optional:** Add an OpenAI API key for GPT-powered summaries. Without it, a built-in rule-based NLP engine handles categorization automatically.

### 3. Build the frontend

```bash
cd frontend
npm run build
```

### 4. Start the backend (serves frontend too)

```bash
cd ../backend
npm start
```

### 5. Open the app

Visit: **http://localhost:8080**

---

## 🔄 Development Mode (with hot reload)

Open **two terminals**:

**Terminal 1 — Frontend (watch mode):**
```bash
cd frontend
npm run dev
```

**Terminal 2 — Backend:**
```bash
cd backend
npm run dev
```

Then open **http://localhost:5173** (Vite dev server proxies API calls to port 8080).

---

## 🧭 User Flow

1. Open **http://localhost:8080**
2. Click **"Connect Gmail Account"**
3. Sign in with Google and grant read-only Gmail access
4. You'll be redirected back to the app
5. Click **"Sync Now"** to fetch and analyze your emails
6. Browse your AI-categorized inbox with summaries, priority tags, and keyword highlights

---

## 🏗️ Project Structure

```
smart-email/
├── backend/
│   ├── server.js          # Express server (OAuth, Gmail API, NLP)
│   ├── .env               # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Root app + routing logic
│   │   ├── main.jsx                   # React entry point
│   │   ├── index.css                  # Tailwind + global styles
│   │   ├── components/
│   │   │   ├── EmailCard.jsx          # Individual email card (expandable)
│   │   │   ├── FilterBar.jsx          # Category/priority/search filters
│   │   │   ├── StatsBar.jsx           # Inbox stats overview
│   │   │   └── SkeletonEmail.jsx      # Loading skeleton
│   │   ├── pages/
│   │   │   ├── ConnectPage.jsx        # Gmail OAuth landing page
│   │   │   └── InboxPage.jsx          # Main inbox view
│   │   └── utils/
│   │       ├── api.js                 # Axios API client
│   │       └── emailUtils.js          # Date/name formatting, category configs
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── package.json                       # Root convenience scripts
```

---

## 🔌 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/auth/google` | Redirect to Google OAuth |
| GET | `/gmail-callback` | Handle OAuth callback, store tokens |
| GET | `/auth/status?user=email` | Check authentication status |
| GET | `/emails?user=email` | Fetch + NLP-process emails |

---

## 🧠 NLP Features

Each email is analyzed for:

| Feature | Description |
|---------|-------------|
| **Summary** | 1-2 sentence AI-generated overview |
| **Category** | Work / Personal / Finance / Promotions / Social / Updates / Spam |
| **Priority** | High / Medium / Low |
| **Keywords** | Top 3-4 relevant terms |
| **Sentiment** | Positive / Neutral / Negative |
| **Action Required** | Whether the email needs a reply or action |

**NLP strategy:** Uses OpenAI GPT-3.5 if an API key is provided, otherwise falls back to a fast built-in rule-based engine (no API key needed).

---

## ⚙️ Google Cloud Console Setup

Make sure your Google OAuth app has:

1. **Authorized redirect URIs:** `http://localhost:8080/gmail-callback`
2. **Scopes enabled:**
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`

If you see `redirect_uri_mismatch` errors, verify the redirect URI in Google Cloud Console matches exactly.

---

## 🛡️ Security Notes

- Gmail access is **read-only** — the app never modifies or sends emails
- Tokens are stored in memory only (no database, no disk persistence)
- Reconnect after server restart — tokens reset on each start
- Never commit `.env` to version control

---

## 🐛 Troubleshooting

**"redirect_uri_mismatch"** — Add `http://localhost:8080/gmail-callback` to authorized redirect URIs in Google Cloud Console.

**"Access blocked: This app's request is invalid"** — Your OAuth app may be in test mode. Add your Google account as a test user in Google Cloud Console → OAuth consent screen.

**No emails showing** — Make sure you clicked "Sync Now" after connecting. Check backend console for errors.

**OpenAI errors** — The app works without OpenAI. Leave `OPENAI_API_KEY` blank or as placeholder to use built-in NLP.
