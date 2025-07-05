import { JobMonitor } from "./scripts/job-monitor.js";
import { IconManager } from "./scripts/icon-manager.js";

console.log("Upwork Job Alert - Background script loaded");

const jobMonitor = new JobMonitor();
const iconManager = new IconManager();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start") {
    console.log("🚀 Starting Upwork job monitoring...");
    console.log("Config:", message.config);

    const success = jobMonitor.start(
      message.config,
      message.bearerToken,
      message.tokenExpiry
    );

    if (success) {
      iconManager.setRunning();
    }

    sendResponse({ success });
  } else if (message.action === "stop") {
    console.log("⏹️ Stopping Upwork job monitoring...");

    jobMonitor.stop();
    iconManager.setStopped();

    sendResponse({ success: true });
  } else if (message.action === "isRunning") {
    sendResponse({
      success: true,
      isRunning: jobMonitor.isRunning(),
    });
  } else {
    sendResponse({ success: false });
  }

  return true;
});

chrome.notifications.onClicked.addListener((notificationId) => {
  // Extract job ciphertext from notification ID
  const ciphertext = notificationId.replace("job_", "");
  const jobUrl = `https://www.upwork.com/jobs/${ciphertext}`;

  // Open the job URL in a new tab
  chrome.tabs.create({ url: jobUrl });

  // Clear the notification
  chrome.notifications.clear(notificationId);
});


// Initialize with stopped icon
iconManager.setStopped();
