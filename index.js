import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";

const { Client, LocalAuth } = pkg;

// ---- Settings (edit these) ----
const BUSINESS_INFO = `
You are a friendly WhatsApp assistant for my business.
- Reply in the same language the customer uses (Tamil, English, or Tanglish).
- Keep replies short: 1-4 sentences, like a normal WhatsApp message.
- If you don't know something (prices, availability, personal details), say the owner will reply soon. Never make up facts.
`;
const MAX_HISTORY = 20; // messages remembered per chat
const REPLY_IN_GROUPS = false;
// --------------------------------

const claude = new Anthropic(); // reads ANTHROPIC_API_KEY from .env
const histories = new Map(); // chatId -> [{ role, content }]

async function askClaude(chatId, userText) {
  const history = histories.get(chatId) ?? [];
  history.push({ role: "user", content: userText });

  const response = await claude.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 2000,
    system: BUSINESS_INFO,
    output_config: { effort: "low" }, // quick chat replies
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages: history,
  });

  if (response.stop_reason === "refusal") {
    history.pop();
    return null;
  }

  const reply = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  history.push({ role: "assistant", content: reply });
  // Keep the newest messages only; must start with a user turn.
  while (history.length > MAX_HISTORY || history[0]?.role !== "user") history.shift();
  histories.set(chatId, history);
  return reply;
}

const whatsapp = new Client({
  authStrategy: new LocalAuth(), // saves login so you scan the QR only once
  puppeteer: { args: ["--no-sandbox"] },
});

whatsapp.on("qr", (qr) => {
  console.log("Scan this QR in WhatsApp > Linked devices > Link a device:");
  qrcode.generate(qr, { small: true });
});

whatsapp.on("ready", () => console.log("✅ WhatsApp agent is running!"));

whatsapp.on("message", async (msg) => {
  try {
    if (msg.fromMe || msg.from === "status@broadcast") return;
    if (!REPLY_IN_GROUPS && msg.from.endsWith("@g.us")) return;
    if (msg.type !== "chat" || !msg.body.trim()) return; // text only

    console.log(`📩 ${msg.from}: ${msg.body}`);
    const chat = await msg.getChat();
    await chat.sendStateTyping();

    const reply = await askClaude(msg.from, msg.body);
    if (reply) {
      await msg.reply(reply);
      console.log(`🤖 -> ${msg.from}: ${reply}`);
    }
  } catch (err) {
    console.error("Error handling message:", err.message);
  }
});

whatsapp.initialize();
