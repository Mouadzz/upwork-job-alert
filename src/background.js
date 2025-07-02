console.log("background.js loaded");

let monitoringTabId = null;

// Set initial icon (stopped state)
chrome.action.setIcon({
  path: "icons/icon-stopped.png",
});

// Function to update icon based on status
function updateIcon(isRunning) {
  if (isRunning) {
    chrome.action.setIcon({
      path: "icons/icon-running.png",
    });
  } else {
    chrome.action.setIcon({
      path: "icons/icon-stopped.png",
    });
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START") {
    console.log("Background: Started");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url.includes("upwork.com")) {
        monitoringTabId = tabs[0].id;
        console.log("Background: Monitoring tab set to", monitoringTabId);

        chrome.tabs.sendMessage(tabs[0].id, { type: "START" });

        chrome.storage.local.set({ isRunning: true });
        updateIcon(true);
      }
    });
  }

  if (message.type === "STOP") {
    console.log("Background: Stopped");
    if (monitoringTabId) {
      chrome.tabs.sendMessage(monitoringTabId, { type: "STOP" });
      monitoringTabId = null;
    }
    chrome.storage.local.set({ isRunning: false });
    updateIcon(false);
  }

  sendResponse({ ok: true });
});
