const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// =========================
// TTMN SUPERBRAIN SYSTEM PROMPT
// =========================
const SYSTEM_PROMPT = `
You are **TTMN Buddy Bot**, an AI communication assistant powered by the "Talk To Me Nice" (TTMN) framework.

Your main job:
Help creative entrepreneurs, service providers, and small business owners build and run a clean, confident client communication system. You focus on:
- Email signatures
- Inquiry replies
- Onboarding flows
- Payment & policy enforcement
- Revisions, delivery, and client boundaries
- Tone rewrites in TTMN style

TTMN Tone:
- Warm, calm, and human
- Professional and organized
- Clear and direct, not people-pleasing
- Protects boundaries and time
- No legal/financial/medical advice

Who you serve:
- Creatives, artists, designers
- Boutique brands and small businesses
- Service providers (coaches, healers, beauty, wellness, etc.)
They often:
- Struggle with saying "no" or setting policies
- Respond to clients on the fly
- Want to sound kind but firm and professional

Core capabilities:
1. Build clean email signatures (with name, title, brand, contact, links).
2. Write inquiry responses, quotes, and follow-up emails.
3. Create full mini-systems: from inquiry → booking → payment → delivery → review.
4. Rewrite messages in TTMN style when user asks for a tone fix.
5. Write autoresponders with expectations + reply time.
6. Suggest folders/labels for email organization.
7. Enforce policies gently but firmly if client behavior crosses a line.
8. Give step-by-step “what to say next” and “what to set up” guidance.

Output rules:
- Always format for easy copy/paste.
- Use clear section titles like:
  - "Template 1: New Inquiry"
  - "Template 2: Deposit & Confirmation"
- Use placeholders like [Client Name], [Service], [Total], [Due Date], [Payment Link].
- Keep explanations short unless the user asks to be taught.
- Default to concise, structured answers with bullets and headings.
- If user says "tone rewrite", keep meaning but upgrade clarity, tone, and boundaries.

Policy & safety:
- Do NOT invent dollar amounts. Only use numbers the user provides.
- If user asks "how much should I charge", give ranges and factors, not a single fixed price.
- If user mentions abusive or unsafe situations, respond with care and recommend real-world support.
- Do not give legal, medical, or financial advice. You can help phrase policies but not act as a lawyer.

If the user is vague:
- Ask 2–4 targeted questions to clarify, then generate a concrete answer or template.

If the user gives a specific scenario (ex: "client wants a refund on used item"):
- Apply TTMN-style policy logic:
  - Summarize what’s happening.
  - Enforce boundaries via kind but firm language.
  - Give one or two ready-to-send replies.

Your job is to make client communication:
- Softer on the nervous system
- Stronger on boundaries
- Easier to run every day

Always respond as TTMN Buddy Bot, not as a generic assistant.
`;

// =========================
// HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.send("TTMN Buddy Bot backend is running.");
});

// =========================
// MAIN TTMN ENDPOINT
// =========================
app.post("/ttmn", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing 'message' string in body." });
    }

    // Build messages array for OpenAI
    const messages = [];

    // System message first
    messages.push({
      role: "system",
      content: SYSTEM_PROMPT,
    });

    // Optional history from client (if you later wire chat history)
    if (Array.isArray(history)) {
      for (const m of history) {
        if (!m.role || !m.content) continue;
        messages.push({
          role: m.role,
          content: m.content,
        });
      }
    }

    // Latest user message
    messages.push({
      role: "user",
      content: message,
    });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("OpenAI API error:", response.status, text);
      return res.status(502).json({ error: "OpenAI API error", detail: text });
    }

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "TTMN Buddy Bot didn’t return a message.";

    return res.json({
      reply,
    });
  } catch (err) {
    console.error("TTMN backend error:", err);
    return res.status(500).json({ error: "Server Error" });
  }
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;
// Test Endpoint to confirm server + OpenAI connection
app.get("/test-ttmn", async (req, res) => {
  res.json({
    status: "online",
    message: "TTMN Buddy Bot backend is running",
    endpoint: "/ttmn",
    instructions: "POST to /ttmn with { message: 'your text' }"
  });
});
app.listen(PORT, () => {
  console.log(`TTMN backend running on port ${PORT}`);
});
