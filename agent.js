import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

// ---- Settings (edit these) ----
export const BUSINESS_INFO = `
You are a friendly WhatsApp assistant for my business.
- Reply in the same language the customer uses (Tamil, English, or Tanglish).
- Keep replies short: 1-4 sentences, like a normal WhatsApp message.
- If you don't know something (prices, availability, personal details), say the owner will reply soon. Never make up facts.
`;
export const MAX_HISTORY = 20; // messages remembered per chat
export const REPLY_IN_GROUPS = false;
// --------------------------------

const claude = new Anthropic(); // reads ANTHROPIC_API_KEY from .env
const histories = new Map(); // chatId -> [{ role, content }]

export async function askClaude(chatId, userText) {
  const history = histories.get(chatId) ?? [];
  history.push({ role: "user", content: userText });

  const response = await claude.beta.messages.create({
    model: "claude-sonnet-5-5",
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

export function resetChat(chatId) {
  histories.delete(chatId);
}
