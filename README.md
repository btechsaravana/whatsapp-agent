# WhatsApp AI Agent

A simple WhatsApp auto-reply agent. It links to your WhatsApp account through WhatsApp Web (by scanning a QR code) and replies to customers' messages automatically, using your business details.

## Features

- Replies to private text messages automatically using Claude (`claude-sonnet-5-5`)
- Remembers the last 20 messages of each chat for context
- Replies in the customer's language (Tamil, English, or Tanglish)
- Skips group chats and status updates (configurable)
- Test chat in the terminal, so you can try replies without WhatsApp
- Scan the QR code once; the login is saved for later runs
- If Claude declines a message, the request is automatically retried on another Claude model

## Requirements

- [Node.js](https://nodejs.org/) 18 or newer
- An Anthropic API key from [console.anthropic.com](https://console.anthropic.com)
- A phone with WhatsApp installed

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/whatsapp-agent.git
cd whatsapp-agent
```

### 2. Install dependencies

```bash
npm install
```

> This also downloads a Chromium browser for WhatsApp Web, so the first install can take a few minutes.

### 3. Add your API key

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and replace `paste-your-key-here` with your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

> Never commit your `.env` file. It is already listed in `.gitignore`.

### 4. Add your business details

Open `agent.js` and edit the `BUSINESS_INFO` text at the top. Add your services, timings and prices. Claude only knows what you write here.

### 5. Test the replies (optional, no WhatsApp needed)

Before linking your real number, chat with the bot in the terminal:

```bash
npm run chat
```

Type messages like a customer would and check the replies. Type `/reset` to start a new conversation, or `/exit` to quit. Edit `BUSINESS_INFO` and run it again until you're happy with the answers.

### 6. Start the agent

```bash
npm start
```

### 7. Link your WhatsApp

A QR code appears in the terminal. On your phone, open **WhatsApp → Linked devices → Link a device** and scan it.

When you see `✅ WhatsApp agent is running!`, the agent is working. Send a test message from another phone to check it.

### 8. Stop the agent

Press `Ctrl + C` in the terminal.

## Settings

You can change these at the top of `agent.js`:

| Setting           | Description                                   | Default |
| ----------------- | --------------------------------------------- | ------- |
| `BUSINESS_INFO`   | Instructions and business details for the bot | Sample text |
| `MAX_HISTORY`     | How many messages the bot remembers per chat  | `20`    |
| `REPLY_IN_GROUPS` | Also reply in group chats                     | `false` |

## Project files

| File            | Purpose                                     |
| --------------- | ------------------------------------------- |
| `agent.js`      | Claude logic and settings (shared)          |
| `index.js`      | Connects the agent to WhatsApp              |
| `test-chat.js`  | Test chat in the terminal (`npm run chat`)  |
| `package.json`  | Project dependencies                        |
| `.env.example`  | Template for your API key                   |
| `.gitignore`    | Keeps secrets and login data out of Git     |

## Important notes

- **Unofficial connection:** This project uses [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js), which is not an official WhatsApp API. WhatsApp could ban the number, though the risk is small. A spare number is safer for testing.
- **Keep it running:** Your computer must stay on with the agent running for it to reply.
- **Replies to everyone:** The bot answers every private chat. Change the `message` handler in `index.js` if you want to limit it to certain contacts or keywords.
- **Login data:** WhatsApp login data is saved in the `.wwebjs_auth` folder. Don't share or commit it. Delete it if you want to link a different number.
