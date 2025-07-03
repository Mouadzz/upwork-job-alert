window.TabSwitcher = class TabSwitcher {
  constructor() {
    this.intervalId = null;
    this.timeoutId = null;
    this.currentTab = 0;
    this.SWITCH_INTERVAL = 10000;
    this.WAIT_AFTER_SWITCH = 5000;
  }

  start() {
    this.stop();
    log(
      `Starting monitoring - switching tabs every ${
        this.SWITCH_INTERVAL / 1000
      } seconds`
    );

    this.switchTabs();
    this.intervalId = setInterval(
      () => this.switchTabs(),
      this.SWITCH_INTERVAL
    );
  }

  stop() {
    log("STOP command received");

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      log("Interval cleared");
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      log("Timeout cleared");
    }

    log("Monitoring stopped");
  }

  switchTabs() {
    try {
      const feedTabsContainer = document.querySelector(
        '[data-test="feed-tabs"]'
      );
      if (!feedTabsContainer) {
        log("Feed tabs container not found");
        return;
      }

      const tabsList = feedTabsContainer.querySelector("ul");
      if (!tabsList) {
        log("Tabs list (ul) not found");
        return;
      }

      const tabs = tabsList.querySelectorAll("li");
      if (tabs.length < 2) {
        log("Not enough tabs found");
        return;
      }

      const targetTab = tabs[this.currentTab];
      const clickableElement = targetTab.querySelector("button");

      if (clickableElement) {
        clickableElement.click();
        const tabName = this.currentTab === 0 ? "Best Match" : "Most Recent";
        log(`🔄 Switched to ${tabName} tab`);

        const clickedTab = this.currentTab;

        // Clear any existing timeout
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
        }

        this.timeoutId = setTimeout(() => {
          findJobs(clickedTab);
          this.timeoutId = null;
        }, this.WAIT_AFTER_SWITCH);
      } else {
        log("Clickable element not found in tab");
      }

      // Switch to the other tab for next iteration
      this.currentTab = this.currentTab === 0 ? 1 : 0;
    } catch (error) {
      log(`Error switching tabs: ${error.message}`);
    }
  }
};
