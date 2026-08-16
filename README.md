# RFQ
Broadcom FreightSphere RFQ Master

## AI analysis (Gemini)

Three tabs can draft written commentary from the figures already on screen:

| Tab | Card | What it writes |
| --- | --- | --- |
| 6 · Winner & Award | Vendor-selection rationale | Award justification from the cost/service scores |
| 8 · Summary | Executive summary | Savings, award mix, cycle time, risks |
| 9 · YoY | Rate movement commentary | What moved, why, and the budget implication |

Output is stored on the RFQ (`R.ai`), so it syncs and prints with the rest of the
project. Every card is a draft — check the numbers before it leaves the building.

### Setup

The Gemini API key is **never** in `index.html`. It lives as a secret on the
`gemini-analyze` Supabase Edge Function, which the browser calls through
`supabase-js`.

```bash
supabase secrets set GEMINI_API_KEY=your-key-here
supabase functions deploy gemini-analyze
```

Optional — pin a different model (defaults to `gemini-3.6-flash`):

```bash
supabase secrets set GEMINI_MODEL=gemini-3.7-flash
```

Until the secret is set the cards return a clear "GEMINI_API_KEY is not set"
message rather than failing silently.
