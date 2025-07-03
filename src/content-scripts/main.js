// Prevent multiple instances
if (window.upworkTrackerLoaded) {
  log("Script already loaded, exiting");
  // Don't use return here, use a flag instead
} else {
  window.upworkTrackerLoaded = true;

  log("Main script loaded at: " + new Date().toLocaleTimeString());

  let tabSwitcher = null;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log(`Received message: ${message.type}`);

    if (message.type === "START") {
      // Initialize job filter config if provided
      if (message.config && window.initJobFilterConfig) {
        window.initJobFilterConfig(message.config);
      }

      // Create tab switcher with config
      tabSwitcher = new TabSwitcher(message.config || {});
      tabSwitcher.start();
    } else if (message.type === "STOP") {
      if (tabSwitcher) {
        tabSwitcher.stop();
      }
    }

    sendResponse({ ok: true });
  });

  // Cleanup on page unload
  window.addEventListener("beforeunload", () => {
    log("Page unloading, cleaning up...");
    if (tabSwitcher) {
      tabSwitcher.stop();
    }
  });

  log("Main script setup complete");
}
