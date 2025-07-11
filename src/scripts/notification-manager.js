import { formatTelegramJobMessage } from "./format-telegram-msg";

export class NotificationManager {
  constructor() {
    this.BOT_TOKEN = import.meta.env.VITE_BOT_TOKEN;
    this.CHAT_ID = import.meta.env.VITE_CHAT_ID;
  }

  async sendErrorNotification(message) {
    try {
      await this.ensureOffscreenDocument();

      await chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon-error.png",
        title: "Upwork Job Alert - Error",
        message: message,
        priority: 2,
      });

      chrome.runtime.sendMessage({ type: "PLAY_SOUND" });

      if (!this.BOT_TOKEN || !this.CHAT_ID) {
        console.error("Telegram bot token or chat ID not configured");
        return;
      }

      await this.sendTelegramMessage(`Upwork Job Alert - Error\n\n${message} !!!`);
    } catch (error) {
      console.error("Error sending error notification:", error);
    }
  }

  async sendJobNotifications(jobs, endpointName, config) {
    try {
      // Send Chrome notifications if enabled
      if (config.chromeNotifications) {
        await this.sendChromeJobNotifications(jobs, endpointName);
      }

      // Send Telegram notifications if enabled
      if (config.telegramNotifications) {
        await this.sendTelegramJobNotifications(jobs, endpointName);
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
    }
  }

  async sendChromeJobNotifications(jobs, endpointName) {
    try {
      // Create offscreen document once before sending notifications
      await this.ensureOffscreenDocument();

      for (const job of jobs) {
        const title = `New Job • ${endpointName}`;

        let message = "";
        if (job.publishedOn) {
          const timeAgo = this.getShortTimeAgo(job.publishedOn);
          message = `${timeAgo} • ${job.title}`;
        } else {
          message = job.title;
        }

        await chrome.notifications.create(`job_${job.ciphertext}`, {
          type: "basic",
          iconUrl: "icons/icon-stopped.png",
          title: title,
          message: message,
        });

        // Play sound without creating new offscreen document
        chrome.runtime.sendMessage({ type: "PLAY_SOUND" });

        await this.delay(1000);
      }
    } catch (error) {
      console.error("Error sending Chrome notification:", error);
    }
  }

  async ensureOffscreenDocument() {
    const contexts = await chrome.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
    });

    if (contexts.length === 0) {
      await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["AUDIO_PLAYBACK"],
        justification: "Play notification sound",
      });
    }
  }

  getShortTimeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  async sendTelegramJobNotifications(jobs, endpointName) {
    if (!this.BOT_TOKEN || !this.CHAT_ID) {
      console.error("Telegram bot token or chat ID not configured");
      return;
    }

    try {
      console.log(`Sending ${jobs.length} Telegram notifications...`);

      // Send each job with a delay to avoid rate limiting
      for (let i = 0; i < jobs.length; i++) {
        const job = jobs[i];

        if (i > 0) {
          await this.delay(1000);
        }

        const message = formatTelegramJobMessage(job, endpointName);
        await this.sendTelegramMessage(message);
      }
    } catch (error) {
      console.error("Error sending Telegram notifications:", error);
    }
  }

  async sendTelegramMessage(message) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: this.CHAT_ID,
            text: message,
            parse_mode: "Markdown",
            disable_web_page_preview: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to send Telegram message:", error);
      throw error;
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
