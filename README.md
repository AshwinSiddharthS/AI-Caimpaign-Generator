
# CampaignAI

AI-powered ecommerce campaign copy, built for every channel.

🔗 **Live demo:** https://ai-caimpaign-generator.vercel.app/
🎥 **Demo video:** https://drive.google.com/file/d/1MfIHsp5oGQ50sBSsbeVwbwKTKBTJhTfm/view?usp=drivesdk
⚙️ **Backend health check:** https://ai-caimpaign-generator.onrender.com/api/v1/health

> Note: the backend runs on Render's free tier, so the first request after idle can take 30 to 60 seconds to wake up.

---

## Features

- **One-shot generation** — enter your campaign details once, get copy for all channels
- **5 email subject lines** — different angles: benefit, offer, curiosity, urgency, audience-direct
- **3 preview texts** — each complementing the subject lines
- **Promotional email** — with email-client-style preview
- **WhatsApp message** — with chat-bubble preview
- **SMS** — with live character count (n/160) and over-limit warning
- **Per-section regeneration** — regenerate just one piece without losing everything else
- **One-click copy** — clipboard API with fallback, Copy→Copied state
- **Markdown export** — download all copy as a structured `.md` file
- **Stale detection** — shows a warning if you change inputs after generating

---

## Setup

### Prerequisites

- Node.js 20+
- A [Google AI Studio](https://aistudio.google.com) API key (free tier)

### Installation

```bash
# 1. Clone the repo
git clone <repo-url>
cd campaign-ai

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example server/.env
# Edit server/.env and add your GEMINI_API_KEY
```

### Running locally

```bash
# Start both server and client in development mode
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000
- **API health:** http://localhost:5000/api/v1/health

> The Vite dev server proxies `/api` → `http://localhost:5000`, so there's no CORS config needed locally.

### Environment variables (server/.env)

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` \| `production` |
| `PORT` | `5000` | Server port |
| `AI_PROVIDER` | `gemini` | `gemini` \| `mock` (mock refused in production) |
| `GEMINI_API_KEY` | — | **Required** when `AI_PROVIDER=gemini` |
| `AI_MODEL` | `gemini-3.5-flash` | Gemini model name |
| `AI_TEMPERATURE` | `0.9` | Generation temperature (0–2) |
| `AI_MAX_OUTPUT_TOKENS` | `2048` | Max tokens per response |
| `AI_TIMEOUT_MS` | `25000` | Per-attempt timeout in ms |
| `AI_MAX_RETRIES` | `1` | Extra retries after failure (max 2 attempts total) |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin(s), comma-separated |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Global requests per window |
| `AI_RATE_LIMIT_MAX_REQUESTS` | `20` | AI endpoint requests per window |

---

## Architecture

```
React client ──/api proxy──▶ Express API ──▶ CampaignService ──▶ AIProvider
  (Vite)                       validation        quality checks      ├── GeminiProvider
                               rate limit        retry/timeout       └── MockProvider
                               error handler     SMS count
```

- **Shared Zod schemas** (`shared/`) — single source of truth for types, used by both client and server
- **GeminiProvider** — uses `responseMimeType: "application/json"` + `responseSchema` for structured output
- **Quality validator** — catches SMS > 160 chars, duplicates, placeholders, empty fields; triggers retry
- **MockProvider** — for tests and development without quota; refused in `NODE_ENV=production`

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js 20 + Express + TypeScript (tsx) |
| AI | Google Gemini via `@google/genai` |
| Validation | Zod (shared between client and server) |
| Security | helmet, cors, express-rate-limit |

---

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Health check — never calls AI |
| `POST` | `/api/v1/campaigns/generate` | Generate full campaign copy |
| `POST` | `/api/v1/campaigns/regenerate` | Regenerate a single section |

### Error envelope

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": [{ "field": "productName", "message": "Required" }],
    "requestId": "uuid"
  }
}
```

Error codes: `VALIDATION_ERROR` (400), `RATE_LIMITED` (429), `AI_RESPONSE_INVALID` (502), `AI_PROVIDER_ERROR` (502), `REQUEST_TIMEOUT` (504), `INTERNAL_ERROR` (500).

---

## Sample Output

**Input:** AirStride Running Shoes | 20% Off + Free Shipping | Energetic tone

**Subject Lines:**
1. Run Farther, Feel Better with AirStride
2. 20% Off + Free Shipping on AirStride Shoes
3. What If Your Shoes Could Keep Up With You?
4. Weekend Sale Ends Soon — Don't Miss Out
5. For Runners Who Refuse to Compromise

**SMS:** `AirStride Sale: 20% Off + Free Shipping this weekend only. Lightweight running shoes built for daily comfort. Shop: [link]` (129/160 chars)

---

## Security Notes

- API key is server-only; the browser never sees it
- `helmet()` security headers on all responses
- Rate limiting: 100 req/15min global, 20 req/15min on AI routes
- Body size limited to 100kb
- No stack traces or internals leaked in production error responses
- Prompt injection defence: user data wrapped in `<campaign_data>` delimiters

---

## Deployment (Render)

1. Push to GitHub
2. Render → New Web Service → connect repo
3. **Build command:** `npm ci && npm run build --workspace client`
4. **Start command:** `npm run start --workspace server`
5. Set env vars in Render dashboard (never in Git)
6. Set `NODE_ENV=production`

> Free Render services sleep when idle. Open the URL a few minutes before a demo — first request after sleep can take 30–60 s.
