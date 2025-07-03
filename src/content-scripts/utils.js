window.log = function (message, data) {
  // Keep the original console logging
  if (data && typeof data === "object") {
    console.log(`[UPWORK-TRACKER] ${message}`);
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(`[UPWORK-TRACKER] ${message}`);
  }

  // Send message to popup for display
  try {
    chrome.runtime.sendMessage({
      type: "LOG",
      message: message,
      data: data,
    });
  } catch (error) {
    // Silently fail if extension context is not available
    console.warn("Could not send log to popup:", error);
  }
};
