import { JobMonitor } from "./scripts/job-monitor.js";
import { IconManager } from "./scripts/icon-manager.js";

console.log("Upwork Job Alert - Background script loaded");

const jobMonitor = new JobMonitor();
const iconManager = new IconManager();

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("index.html"),
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start") {
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
    console.log("Stopping Upwork job monitoring...");

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
  const ciphertext = notificationId.replace("job_", "");
  const jobUrl = `https://www.upwork.com/jobs/${ciphertext}`;

  chrome.tabs.create({ url: jobUrl });

  chrome.notifications.clear(notificationId);
});

iconManager.setStopped();
