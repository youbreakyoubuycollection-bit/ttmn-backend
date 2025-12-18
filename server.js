const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

function generateLicense(client) {
  const suffix = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `TTMN-${client.toUpperCase()}-${Date.now()}-${suffix}`;
}

const app = express();
app.use(cors());
app.use((req, res, next) => {
  if (req.originalUrl === "/stripe-webhook") {
    next(); // leave raw body intact for Stripe
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.redirect("/widget.html");
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
const LICENSES_PATH = path.join(__dirname, "licenses.json");

function loadLicenses() {
  try {
    const raw = fs.readFileSync(LICENSES_PATH, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Could not load licenses.json:", e.message);
    return {};
  }
}
app.post("/verify-license", (req, res) => {
  const { client, license } = req.body || {};

  if (!client || !license) {
    return res.status(400).json({
      valid: false,
      reason: "missing_client_or_license",
    });
  }

  const licenses = loadLicenses();
  const record = licenses[String(client).toLowerCase()];

  if (!record) {
    return res.json({ valid: false, reason: "client_not_found" });
  }

  if (record.status !== "active") {
    return res.json({ valid: false, reason: "inactive" });
  }

  if (record.license !== license) {
    return res.json({ valid: false, reason: "bad_key" });
  }

  return res.json({ valid: true });
});

app.post("/stripe-webhook", express.raw({ type: "application/json" }), (req, res) => {
  let event;

  try {
event = JSON.parse(req.body.toString());  } catch (err) {
    return res.status(400).send("Invalid payload");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const client =
      session.metadata?.client ||
      session.customer_email?.split("@")[0];

    if (client) {
      const licenses = loadLicenses();
      const licenseKey = generateLicense(client);

      licenses[client.toLowerCase()] = {
        license: licenseKey,
        status: "active",
        created: new Date().toISOString()
      };

      fs.writeFileSync(LICENSES_PATH, JSON.stringify(licenses, null, 2));

      console.log("License created for:", client);
    }
  }

  res.json({ received: true });
});
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
