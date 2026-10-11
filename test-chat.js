// Chat with the agent in the terminal, without WhatsApp.
import readline from "node:readline";
import { askClaude, resetChat } from "./agent.js";

const CHAT_ID = "local-test";
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let closed = false;
rl.on("close", () => (closed = true));

console.log("💬 Test chat started. Type like a customer would.");
console.log("   /reset = start a new conversation, /exit = quit\n");
rl.setPrompt("You: ");
rl.prompt();

for await (const line of rl) {
  const text = line.trim();
  if (text === "/exit") break;

  if (text === "/reset") {
    resetChat(CHAT_ID);
    console.log("(conversation cleared)\n");
  } else if (text) {
    try {
      const reply = await askClaude(CHAT_ID, text);
      console.log(`Bot: ${reply ?? "(no reply - message was declined)"}\n`);
    } catch (err) {
      console.error(`Error: ${err.message}\n`);
    }
  }
  if (!closed) rl.prompt();
}

rl.close();
