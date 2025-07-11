export class IconManager {
  setRunning() {
    chrome.action.setIcon({
      path: "icons/icon-running.png",
    });

    chrome.action.setTitle({
      title: "Upwork Job Alert - Running",
    });
  }

  setStopped() {
    chrome.action.setIcon({
      path: "icons/icon-stopped.png",
    });

    chrome.action.setTitle({
      title: "Upwork Job Alert - Stopped",
    });
  }

  setError() {
    chrome.action.setIcon({
      path: "icons/icon-error.png",
    });

    chrome.action.setTitle({
      title: "Upwork Job Alert - Error",
    });
  }
}
