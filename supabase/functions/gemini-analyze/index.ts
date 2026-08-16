// FreightSphere — Gemini analysis proxy
//
// Keeps GEMINI_API_KEY server-side. The browser never sees it; index.html calls
// this function through supabase-js (which supplies the publishable key as the
// Authorization header, so Supabase's built-in JWT check applies).
//
// Deploy:  supabase functions deploy gemini-analyze
// Secret:  supabase secrets set GEMINI_API_KEY=...   [required]
//          supabase secrets set GEMINI_MODEL=...     [optional, see MODEL below]

import { GoogleGenAI } from "npm:@google/genai@2.17.1";

const API_KEY = Deno.env.get("GEMINI_API_KEY");
const MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-3.6-flash";

// The brief is generated from the RFQ in the browser; cap it so a corrupt or
// oversized project can't turn into a runaway prompt.
const MAX_BRIEF_BYTES = 200_000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM = `You are a senior freight procurement analyst at Broadcom, writing for
the VP of Global Logistics. You are given the structured results of a freight RFQ and
must turn them into a short written analysis.

Rules:
- Use only the numbers in the brief. Never invent lanes, forwarders, rates or savings.
- If a figure is missing or null, say the data isn't available rather than estimating.
- Currency is given in the brief; always state it with figures.
- Be specific and quantitative. "Kuehne+Nagel wins 62% of air spend at 1.84 USD/kg"
  beats "one forwarder performs strongly".
- Be direct about risk: single-source exposure, thin coverage, judges not finished,
  provisional awards, rate increases.
- Plain prose and short bullets. No preamble, no filler, no restating the question.
- Format with "## " section headings, "- " bullets and **bold** for emphasis.
- Around 300-450 words unless the brief is very thin.`;

const TASKS: Record<string, string> = {
  executive: `Write an executive summary of this RFQ for a management review.
Cover: headline savings and what drives them, how spend splits across forwarders,
which categories moved most, cycle time against the milestone plan, and the two or
three things management should actually decide or watch.
Sections: ## Headline, ## Where the savings come from, ## Award mix, ## Risks & watch-outs.`,

  award: `Draft the vendor-selection rationale that will sit in the award paper.
Explain who won and why, grounded in the cost score / service score / combined score and
the cost-vs-service weighting. Contrast the winner with the runner-up. Call out where the
scoring is close enough that the decision is finely balanced, and any concentration risk
in the resulting award.
Sections: ## Recommendation, ## Scoring rationale, ## Runner-up comparison, ## Risks & conditions.`,

  yoy: `Explain the year-on-year rate movement to a finance audience.
Cover the overall direction and size of the move, which categories and lanes drive it,
how much is concentrated in a few lanes versus broad-based, and what it implies for next
cycle's budget. Note that spend is computed on this cycle's volumes for both years, so
the movement isolates rate, not volume mix.
Sections: ## Headline, ## What's driving it, ## Notable lanes, ## Budget implication.`,
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);

  if (!API_KEY) {
    return json(
      { error: "GEMINI_API_KEY is not set on this function. Run: supabase secrets set GEMINI_API_KEY=..." },
      500,
    );
  }

  let payload: { kind?: string; brief?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Body must be JSON." }, 400);
  }

  const kind = String(payload.kind ?? "executive");
  const task = TASKS[kind];
  if (!task) {
    return json(
      { error: `Unknown analysis kind "${kind}". Expected one of: ${Object.keys(TASKS).join(", ")}.` },
      400,
    );
  }
  if (!payload.brief || typeof payload.brief !== "object") {
    return json({ error: "Missing RFQ brief." }, 400);
  }

  const brief = JSON.stringify(payload.brief, null, 1);
  if (brief.length > MAX_BRIEF_BYTES) {
    return json({ error: "RFQ brief is too large to analyse." }, 413);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: `${task}\n\nRFQ brief (JSON):\n\`\`\`json\n${brief}\n\`\`\``,
      config: {
        systemInstruction: SYSTEM,
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    const text = res.text?.trim();
    if (!text) return json({ error: "The model returned no text." }, 502);

    return json({ text, model: MODEL, kind });
  } catch (err) {
    console.error("gemini-analyze failed:", err);
    // Surface the provider message (quota, bad key, safety block) without leaking the key.
    const msg = err instanceof Error ? err.message : String(err);
    return json({ error: msg.replace(API_KEY, "[redacted]") }, 502);
  }
});
