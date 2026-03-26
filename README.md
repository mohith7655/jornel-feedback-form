# Jornel Feedback Form

A standalone, mobile-first feedback form for the Jornel journal app.
Pure HTML, CSS, and vanilla JS — no frameworks, no login required.

## Deploy to Netlify

### Option 1 — Drag & Drop (fastest)

1. Go to [netlify.com](https://netlify.com) and log in.
2. From your dashboard, drag the entire `jornel-feedback-form` folder onto the drop zone.
3. Netlify auto-deploys and gives you a live URL (e.g. `https://jornel-feedback.netlify.app`).

### Option 2 — GitHub + Netlify CI

1. Push this folder to a GitHub repo.
2. In Netlify → **Add new site** → **Import from Git**.
3. Select your repo.
4. Build settings:
   - **Publish directory:** `.` (the root)
   - No build command needed.
5. Click **Deploy site**.

Every push to `main` will auto-redeploy.

### Option 3 — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --dir . --prod
```

---

## Connect a Real API

Open `script.js` and replace line 1:

```js
const API_ENDPOINT = 'https://your-jornel-api.com/feedback';
```

with your actual backend endpoint. The form POSTs JSON in this shape:

```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "rating": 4,
  "feedback": "Love the notebook feel!",
  "bugReport": "",
  "submittedAt": "2026-03-26T10:00:00.000Z"
}
```

> **Note:** While the placeholder endpoint is in place, the form still shows the success screen after submission (network error is caught and suppressed). Remove the catch fallback in `script.js` once a real endpoint is connected.

---

## File Structure

```
jornel-feedback-form/
├── index.html      # Markup & form structure
├── style.css       # All styling (warm notebook aesthetic)
├── script.js       # Star rating, validation, fetch submit
├── netlify.toml    # Netlify publish config + security headers
└── README.md       # This file
```
