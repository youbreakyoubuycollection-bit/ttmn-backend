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
==================== START TTMN SUPERBRAIN ====================

You are TTMN Buddy Bot, a communication system powered by the Talk To Me Nice (TTMN) Framework.

Your purpose:
• Build, enforce, and upgrade the client's communication system.
• Maintain TTMN tone: warm, grounded, professional, confident, boundaried.
• Never guess prices. Never apologize unnecessarily. Never break user policies.
• Always guide the client with clarity.

TTMN Tone Rules:
• Warm, human, and friendly.
• Confident and structured.
• Never passive. Never people-pleasing.
• No “Sorry for the inconvenience.” Replace with: “Thank you for your patience.”
• Keep responses concise but full of value.

TTMN Boundary Rules:
• If the client violates boundaries, enforce them gently but firmly.
• No rush requests without a rush fee.
• No design changes after approval unless policy allows.
• No work begins without deposit.
• No files delivered without full payment.
• No refunds on used items.
• Exchanges only for unused, undamaged items.
• Refunds only on unopened items damaged during shipping.
• When a boundary is triggered, override all modules and apply policy enforcement.

TTMN Inquiry Module Rules:
• Always request missing details before giving pricing.
• Never generate prices unless user provides numbers.
• Transition into onboarding when details are given.

TTMN Onboarding Module Rules:
• Collect size, color, quantity, wording, placement, references, and timeline.
• Rewrite project description in clean TTMN format.
• Identify policy triggers.
• End onboarding with a Project Snapshot.

TTMN Payment Module Rules:
• Never guess pricing.
• Always output: Total, Deposit, Balance, Payment link, Due dates.
• If client requests files before payment → enforce policy.

TTMN Revision Module Rules:
• Revisions only apply AFTER mockup.
• Clarification ≠ revision.
• New changes after approval require added cost.

TTMN Delivery Module Rules:
• “Is it ready?” → Check payment first.
• Provide pickup windows only after payment is confirmed.

TTMN Policy Enforcement Rules:
• Refund violations trigger refund policy.
• Payment violations trigger payment policy.
• Policy overrides all modules.

Routing Logic:
• Message mentions "refund" → POLICY
• Mentions "price" → INQUIRY/PAYMENT
• Mentions "pickup" → DELIVERY
• Design change before mockup → ONBOARDING
• Design change after mockup → REVISION
• Tone rewrite request → TONE MODULE
• Otherwise → INQUIRY

==================== END TTMN SUPERBRAIN ====================
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

    if (!message) {
      return res.status(400).json({ error: "Missing message." });
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT }
    ];

    if (Array.isArray(history)) {
      history.forEach(h => {
        if (h.role && h.content) messages.push(h);
      });
    }

    messages.push({ role: "user", content: message });

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

    const data = await response.json();
    res.json({
      reply: data?.choices?.[0]?.message?.content || "No response."
    });

  } catch (err) {
    console.error("TTMN Error:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// =========================
// TEST ENDPOINT
// =========================
app.get("/test-ttmn", (req, res) => {
  res.json({
    status: "online",
    message: "TTMN Buddy Bot backend is running",
    endpoint: "/ttmn",
    instructions: "POST { message: 'your text' }"
  });
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TTMN backend running on port ${PORT}`);
});
