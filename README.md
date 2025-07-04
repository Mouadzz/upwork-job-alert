# Upwork Jobs Notifier Extension

A Chrome extension that monitors new jobs on Upwork and sends notifications via Telegram bot.

## Setup

### 1. Environment Variables

Create a `.env` file in the root directory with your Telegram bot credentials:

```env
VITE_BOT_TOKEN=your_bot_token_here
VITE_CHAT_ID=your_chat_id_here
```

### 2. Getting Telegram Bot Credentials

1. **Create a Bot:**

   - Message [@BotFather](https://t.me/BotFather) on Telegram
   - Send `/newbot` and follow the instructions
   - Copy the bot token

2. **Get Chat ID:**
   - Start a conversation with your bot
   - Send a message to your bot
   - Visit `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find your chat ID in the response

## Usage

```bash
# Install dependencies
npm install

# Build extension
npm run build

# Load extension in Chrome
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the `dist` folder
```

### Running the Extension

1. Make sure you are logged in to your Upwork account
2. Navigate to https://www.upwork.com/nx/find-work/
3. Click the extension icon
4. Configure your job filtering preferences
5. Click "Start" to begin monitoring
6. Get notified via Telegram when new jobs appear
