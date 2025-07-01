console.log("Background loaded");

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

        chrome.tabs.sendMessage(tabs[0].id, { type: "START" }, (response) => {
          if (chrome.runtime.lastError) {
            // main script not loaded, inject it
            chrome.scripting.executeScript(
              {
                target: { tabId: tabs[0].id },
                files: [
                  "content-scripts/utils.js",
                  "content-scripts/job-checker.js",
                  "content-scripts/tab-switcher.js",
                  "content-scripts/main.js",
                ],
              },
              () => {
                // Try sending message again after injection
                chrome.tabs.sendMessage(tabs[0].id, { type: "START" });
              }
            );
          }
        });

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
