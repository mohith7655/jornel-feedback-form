# Jornel Feedback Form

A standalone, mobile-first feedback form for the Jornel journal app.
Pure HTML, CSS, and vanilla JS - no frameworks, no login required.

## Supabase Data Flow

This app uses Supabase directly from the browser.

- Form opens using a token from the URL: `?token=...`
- Token metadata is loaded from `form_tokens`
- Submit updates the same `form_tokens` row with:
  - `status: submitted`
  - `answers`
  - `submitted_at`
- No Microsoft auth and no login flow is required

Supabase config lives in:

- `src/services/supabaseClient.js`
- `src/services/formService.js`

The `answers` payload includes these keys:

- `personName`
- `feedbackDate`
- `gender`
- `age`
- `excitementLevel`
- `rating`
- `demoProject`
- `purchaseIntent`
- `purchaseReason`
- `featuresLiked`
- `featuresDisliked`
- `changesRecommended`
- `phoneNumber`
- `email`

## Deploy to Netlify

### Option 1 - Drag & Drop (fastest)

1. Go to [netlify.com](https://netlify.com) and log in.
2. From your dashboard, drag the entire `jornel-feedback-form` folder onto the drop zone.
3. Netlify auto-deploys and gives you a live URL (for example `https://jornel-feedback.netlify.app`).

### Option 2 - GitHub + Netlify CI

1. Push this folder to a GitHub repo.
2. In Netlify -> **Add new site** -> **Import from Git**.
3. Select your repo.
4. Build settings:
   - **Publish directory:** `.` (the root)
   - No build command needed.
5. Click **Deploy site**.

Every push to `main` will auto-redeploy.

### Option 3 - Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --dir . --prod
```

## File Structure

```text
jornel-feedback-form/
|-- index.html                   # Markup and form structure
|-- style.css                    # Styling
|-- script.js                    # UI behavior and submit flow
|-- src/services/supabaseClient.js
|-- src/services/formService.js
|-- netlify.toml                 # Netlify publish config + security headers
`-- README.md
```