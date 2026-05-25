# Legal Request Triage Tool

AI-assisted legal request triage demo for compliance operations teams.

## Stack

- React + Vite
- Tailwind CSS
- Client-side text extraction (pdfjs-dist, mammoth); sample documents are PDFs
- Vercel serverless API (`api/analyse.js`) → Anthropic Claude

## Setup

```bash
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

## Run locally

Use Vercel dev so the `/api/analyse` route works:

```bash
npx vercel dev
```

For frontend-only development (API calls will fail without a proxy):

```bash
npm run dev
```

## Deploy

1. Push to GitHub and import in Vercel, or run `vercel`.
2. Set `ANTHROPIC_API_KEY` in Vercel project environment variables.

## Project structure

```
src/App.jsx                 — main app & state machine
src/components/UploadZone.jsx
src/components/SampleButtons.jsx
src/components/ResultsPanel.jsx
src/utils/extractText.js    — PDF/DOCX/TXT extraction
src/utils/loadSample.js     — loads sample PDFs via pdfjs-dist
src/samples/*.pdf           — demo documents (regenerate with npm run generate-samples)
api/analyse.js              — serverless Anthropic proxy
```
