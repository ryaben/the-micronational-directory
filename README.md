# the-micronational-directory
Community-oriented platform for registering micronations

## AI entry assistant

The new-entry form can use the Gemini Developer API (`gemini-3.8-flash`) to suggest values from pasted text, public webpage URLs, images, or PDFs. It also adds a preliminary criteria review to each submitted GitHub Issue. The result is triage guidance only: moderators still approve or reject submissions through the existing moderation flow.

For local development, add `GEMINI_API_KEY=...` to `.env` or `.env.local` and restart `npm run dev`; Vite serves the AI endpoint locally. For deployment, set the same variable in Vercel's server-side Environment Variables. Do not use a `VITE_` prefix. The API supports a free tier subject to current model quotas and terms; free-tier data may be used by Google to improve its products. Review Google's [pricing and free-tier details](https://ai.google.dev/gemini-api/docs/pricing) before handling sensitive source material. The feature accepts PNG, JPEG, WebP, and PDF files up to 3 MB, or pasted text up to 12,000 characters.
