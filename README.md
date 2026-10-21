# the-micronational-directory
Community-oriented platform for registering micronations

## AI entry assistant

The new-entry form uses AI to suggest values from source material and to provide preliminary criteria reviews for submitted GitHub Issues. The result is triage guidance only: moderators still approve or reject submissions through the existing moderation flow.

For local development, add `GROQ_API_KEY=...` and `GEMINI_API_KEY=...` to `.env` or `.env.local`, then restart `npm run dev`; Vite serves the AI endpoint locally. Pasted text extraction and submission review use Groq (`qwen/qwen3.8-27b`); URL extraction uses Groq browser search (`openai/gpt-oss-20b`); image/PDF extraction uses Gemini. Allow both Groq models in your Groq project settings. For deployment, set both keys in Vercel's server-side Environment Variables. Do not use a `VITE_` prefix. Check each provider's current limits and data terms before handling sensitive source material: [Groq rate limits](https://console.groq.com/docs/rate-limits) and [Google AI pricing](https://ai.google.dev/gemini-api/docs/pricing). The feature accepts PNG, JPEG, WebP, and PDF files up to 3 MB, or pasted text up to 12,000 characters.
