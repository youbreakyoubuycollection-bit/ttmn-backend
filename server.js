const fs = require("fs");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ========================================
// TTMN SUPERBRAIN SYSTEM PROMPT
// ========================================
const SYSTEM_PROMPT = fs.readFileSync(
  "./knowledge/TTMN_Superbrain_Master.txt",
  "utf8"
);
app.post("/ttmn", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing 'message' string in body." });
    }

    const messages = [];

    // System Superbrain first
    messages.push({
      role: "system",
      content: SYSTEM_PROMPT,
    });

    // Optional chat history (if provided by frontend)
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
        temperature: 0.4,
        messages,
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
      "TTMN Buddy Bot did not generate a response.";

    return res.json({ reply });
  } catch (err) {
    console.error("TTMN backend error:", err);
    return res.status(500).json({ error: "Server Error" });
  }
});

// ========================================
// HEALTH / TEST ENDPOINTS
// ========================================
app.get("/", (req, res) => {
  res.send("TTMN Buddy Bot backend is running.");
});

app.get("/test-ttmn", (req, res) => {
  res.json({
    status: "online",
    message: "TTMN Buddy Bot backend is running",
    endpoint: "/ttmn",
    instructions: "POST { message: 'your text' }",
  });
});

// ========================================
// START SERVER
// ========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TTMN backend running on port ${PORT}`);
});
