// Prevent multiple instances
if (window.upworkTrackerLoaded) {
  log("Script already loaded, exiting");
  // Don't use return here, use a flag instead
} else {
  window.upworkTrackerLoaded = true;

  log("Main script loaded at: " + new Date().toLocaleTimeString());

  const tabSwitcher = new TabSwitcher();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log(`Received message: ${message.type}`);

    if (message.type === "START") {
      tabSwitcher.start();
    } else if (message.type === "STOP") {
      tabSwitcher.stop();
    }

    sendResponse({ ok: true });
  });

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    log("Page unloading, cleaning up...");
    tabSwitcher.stop();
  });

  log("Main script setup complete");
}
