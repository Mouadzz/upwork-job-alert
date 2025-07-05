import { ApiClient } from "./api-client.js";
import { filterJobs } from "./job-filter.js";
import { NotificationManager } from "./notification-manager.js";
import { IconManager } from "./icon-manager.js";

export class JobMonitor {
  constructor() {
    this.running = false;
    this.intervalId = null;
    this.config = {};
    this.bearerToken = "";
    this.tokenExpiry = null;

    // Storage configuration
    this.STORAGE_KEYS = {
      SAVED_JOBS: "upwork_monitor_saved_jobs",
      FIRST_RUN: "upwork_monitor_first_run",
    };

    this.currentEndpoint = "bestMatch";
    this.lastError = null;

    // Initialize dependencies
    this.apiClient = new ApiClient();
    this.notificationManager = new NotificationManager();
    this.iconManager = new IconManager();
  }

  async start(config, bearerToken, tokenExpiry) {
    if (this.running) return false;

    this.config = config;
    this.bearerToken = bearerToken;
    this.tokenExpiry = tokenExpiry;
    this.running = true;

    // Clean storage for fresh start
    await this.cleanStorage();
    this.startMonitoring();

    return true;
  }

  stop() {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async cleanStorage() {
    try {
      await chrome.storage.local.remove(Object.values(this.STORAGE_KEYS));
    } catch (error) {
      console.error("Error cleaning storage:", error);
    }
  }

  isRunning() {
    return this.running;
  }

  isTokenExpired() {
    if (!this.tokenExpiry) return false;
    return new Date() >= new Date(this.tokenExpiry);
  }

  startMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Start immediate fetch, then set interval
    this.fetchAndProcessJobs();
    this.intervalId = setInterval(() => {
      this.fetchAndProcessJobs();
    }, this.config.fetchInterval * 1000);
  }

  async handleAuthError() {
    console.log("Authentication error detected");
    console.log("⏹️ Stopping Upwork job monitoring...");

    this.iconManager.setAuthError();

    await this.notificationManager.sendAuthErrorNotification();

    this.stop();

    // Notify popup about status change
    try {
      await chrome.runtime.sendMessage({
        action: "statusChanged",
        isRunning: false,
      });
    } catch (error) {
      console.log("Popup not available to notify");
    }
  }

  async fetchAndProcessJobs() {
    if (!this.running) return;

    try {
      // Check token expiration
      if (this.isTokenExpired()) {
        await this.handleAuthError();
        return;
      }

      // Fetch jobs from current endpoint
      console.log(`Fetching ${this.currentEndpoint}...`);

      const result = await this.apiClient.fetchJobs(
        this.currentEndpoint,
        this.bearerToken
      );

      if (result.authError) {
        await this.handleAuthError();
        return;
      }

      if (!result.success) {
        return;
      }

      const jobs = result.jobs;
      const endpointName = result.endpointName;

      console.log(`Found ${jobs.length} jobs`);

      const newJobs = await this.compareJobs(jobs, this.currentEndpoint);

      console.log(`${newJobs.length} new jobs`);

      if (newJobs.length > 0) {
        // Filter jobs based on user config
        const filteredJobs = filterJobs(newJobs, this.config);

        console.log(`${filteredJobs.length} passed filters`);

        // Send notifications for filtered jobs
        if (filteredJobs.length > 0) {
          this.notificationManager.sendJobNotifications(
            filteredJobs,
            endpointName,
            this.config
          );
        }
      }

      // Update saved jobs for this endpoint
      await this.updateSavedJobs(
        this.currentEndpoint,
        jobs.map((job) => job.id)
      );

      // Toggle endpoint for next call
      this.currentEndpoint =
        this.currentEndpoint === "bestMatch" ? "recentWork" : "bestMatch";
    } catch (error) {
      console.error("Error fetchAndProcessJobs:", error);
    }
  }

  async compareJobs(jobs, endpointName) {
    const currentJobIds = new Set(jobs.map((job) => job.id));
    const previousJobIds = await this.getSavedJobs(endpointName);

    // First run: save jobs but don't return any as new
    if (await this.isFirstRun(endpointName)) {
      console.log(
        `Saved ${currentJobIds.size} jobs - (first run for ${endpointName})`
      );
      await this.setFirstRunComplete(endpointName);
      return [];
    }

    // Return jobs that weren't previously saved
    return jobs.filter((job) => !previousJobIds.has(job.id));
  }

  // Storage helper methods
  async getSavedJobs(endpointName) {
    try {
      const result = await chrome.storage.local.get(
        this.STORAGE_KEYS.SAVED_JOBS
      );
      const savedJobs = result[this.STORAGE_KEYS.SAVED_JOBS] || {};
      return new Set(savedJobs[endpointName] || []);
    } catch (error) {
      console.error("Error reading saved jobs:", error);
      return new Set();
    }
  }

  async updateSavedJobs(endpointName, jobIds) {
    try {
      const result = await chrome.storage.local.get(
        this.STORAGE_KEYS.SAVED_JOBS
      );
      const savedJobs = result[this.STORAGE_KEYS.SAVED_JOBS] || {};

      savedJobs[endpointName] = jobIds;

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.SAVED_JOBS]: savedJobs,
      });
    } catch (error) {
      console.error("Error saving jobs:", error);
    }
  }

  async isFirstRun(endpointName) {
    try {
      const result = await chrome.storage.local.get(
        this.STORAGE_KEYS.FIRST_RUN
      );
      const firstRunData = result[this.STORAGE_KEYS.FIRST_RUN] || {};
      return firstRunData[endpointName] !== false;
    } catch (error) {
      console.error("Error reading first run data:", error);
      return true;
    }
  }

  async setFirstRunComplete(endpointName) {
    try {
      const result = await chrome.storage.local.get(
        this.STORAGE_KEYS.FIRST_RUN
      );
      const firstRunData = result[this.STORAGE_KEYS.FIRST_RUN] || {};

      firstRunData[endpointName] = false;

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.FIRST_RUN]: firstRunData,
      });
    } catch (error) {
      console.error("Error saving first run data:", error);
    }
  }
}
