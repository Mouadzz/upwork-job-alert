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

  setAuthError() {
    chrome.action.setIcon({
      path: "icons/icon-auth-error.png",
    });

    chrome.action.setTitle({
      title: "Upwork Job Alert - Authentication Error",
    });
  }
}
