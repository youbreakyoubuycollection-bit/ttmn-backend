const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ================================
// LOAD TTMN KNOWLEDGE FILES
// ================================
const knowledgeDir = path.join(__dirname, "knowledge");

let SYSTEM_PROMPT = "";
try {
  SYSTEM_PROMPT = fs
    .readdirSync(knowledgeDir)
    .filter(file => file.endsWith(".txt"))
    .map(file => fs.readFileSync(path.join(knowledgeDir, file), "utf8"))
    .join("\n\n");
} catch (err) {
  console.error("Failed to load knowledge files:", err);
}

// ================================
// MAIN API ENDPOINT
// ================================
app.post("/ttmn", async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      reply: "Please enter a message to continue."
    });
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(Array.isArray(history) ? history : []),
    { role: "user", content: message }
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();

    return res.json({
      reply: data?.choices?.[0]?.message?.content || "No response generated."
    });

  } catch (err) {
    console.error("OpenAI failure:", err.message);

    return res.json({
      reply:
        "TTMN is temporarily unavailable due to high demand. Please try again shortly."
    });
  }
});

// ================================
// HEALTH CHECK
// ================================
app.get("/health", (req, res) => {
  res.send("TTMN backend is running.");
});

// ================================
// START SERVER
// ================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TTMN backend running on port ${PORT}`);
});
