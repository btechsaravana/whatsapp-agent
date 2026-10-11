import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
import { askClaude, REPLY_IN_GROUPS } from "./agent.js";

const { Client, LocalAuth } = pkg;

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
