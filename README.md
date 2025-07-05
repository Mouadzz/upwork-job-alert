# Upwork Jobs Notifier Extension

A Chrome extension that monitors new jobs on Upwork using their GraphQL API and sends notifications via Chrome notifications and Telegram bot.

## Features

- 🔍 Real-time job monitoring using Upwork's GraphQL API
- 📱 Chrome notifications with sound alerts
- 💬 Telegram notifications support
- 🎯 Advanced filtering options:
  - Payment verification requirement
  - Minimum client spending
  - Excluded countries
  - Maximum job age (in minutes)
- 🔊 Customizable notification sounds
- 🔗 Click notifications to open job directly on Upwork

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

### 3. Installation

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

1. Click "Start Monitoring" to begin job monitoring
2. The extension will automatically fetch new jobs based on your configured interval
3. When new jobs match your filters, you'll receive notifications
4. Click on Chrome notifications to open the job directly on Upwork
5. Click "Stop Monitoring" to pause the extension
