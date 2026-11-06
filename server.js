import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import OpenAI from "openai";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const MODEL = process.env.OPENAI_MODEL || "gpt-6-luna";

if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY. Copy .env.example to .env and add your API key.");
  process.exit(1);
}

const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(helmet());
app.use(express.json({ limit: "32kb" }));
app.use(express.static("public"));

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many messages right now. Please wait a little and try again." }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "NS AI" });
});

app.post("/api/chat", chatLimiter, async (req, res) => {
  try {
    const { messages } = req.body ?? {};

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 12) {
      return res.status(400).json({ error: "Send between 1 and 12 recent messages." });
    }

    const input = [];
    for (const item of messages) {
      if (!item || !["user", "assistant"].includes(item.role) ||
          typeof item.content !== "string" || !item.content.trim() ||
          item.content.length > 4000) {
        return res.status(400).json({ error: "A message is invalid or too long (maximum 4,000 characters)." });
      }
      input.push({ role: item.role, content: item.content.trim() });
    }

    if (input[input.length - 1].role !== "user") {
      return res.status(400).json({ error: "The latest message must be from the user." });
    }

    const result = await ai.responses.create({
      model: MODEL,
      instructions: [
        "You are NS AI, a friendly and helpful AI assistant.",
        "Understand and respond naturally in Kannada and English.",
        "Reply in the language the user uses. If they mix Kannada and English, you may mix them naturally.",
        "Be clear, respectful, and concise. If you are unsure, say so.",
        "Do not claim to have performed actions you cannot perform."
      ].join(" "),
      input
    });

    res.json({ reply: result.output_text || "ಕ್ಷಮಿಸಿ, ಈಗ ಉತ್ತರ ಸಿದ್ಧಪಡಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. Please try again." });
  } catch (error) {
    console.error("NS AI request failed:", error?.message || error);
    res.status(500).json({ error: "NS AI couldn't answer right now. Check the server log and try again." });
  }
});

app.listen(PORT, () => {
  console.log(`NS AI is running at http://localhost:${PORT}`);
});
