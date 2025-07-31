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

  async handleError(message) {
    console.log(`Error: ${message}`);
    console.log("Stopping Upwork job monitoring...");

    this.iconManager.setError();

    await this.notificationManager.sendErrorNotification(message);

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
        await this.handleError("Token expired");
        return;
      }

      const endpoint = this.config.endpoint || "bestMatch";

      console.log(`Fetching ${endpoint}...`);

      const result = await this.apiClient.fetchJobs(endpoint, this.bearerToken);

      if (!result.success) {
        await this.handleError(result.error || "Unknown error");
        return;
      }

      const jobs = result.jobs;
      const endpointName = result.endpointName;

      const newJobs = await this.compareJobs(jobs);

      if (newJobs.length > 0) {
        // Filter jobs based on user config
        const filteredJobs = filterJobs(newJobs, this.config);

        // Send notifications for filtered jobs
        if (filteredJobs.length > 0) {
          this.notificationManager.sendJobNotifications(
            filteredJobs,
            endpointName,
            this.config
          );
        }

        await this.addJobsToSaved(newJobs.map((job) => job.id));
      }
    } catch (error) {
      console.error("Error fetchAndProcessJobs:", error);
      await this.handleError(`Unknown Error: ${error.message}`);
    }
  }

  async compareJobs(jobs) {
    const previousJobIds = await this.getSavedJobs();

    if (await this.isFirstRun()) {
      console.log("First run - saving initial jobs");
      await this.setFirstRunComplete();
      // For first run, save all current jobs and return empty array
      await this.addJobsToSaved(jobs.map((job) => job.id));
      return [];
    }

    // Jobs that weren't previously saved
    const newJobs = jobs.filter((job) => !previousJobIds.has(job.id));

    console.log(`Found ${jobs.length} jobs -> ${newJobs.length} jobs are new`);

    return newJobs;
  }

  async getSavedJobs() {
    try {
      const result = await chrome.storage.local.get(
        this.STORAGE_KEYS.SAVED_JOBS
      );
      const savedJobs = result[this.STORAGE_KEYS.SAVED_JOBS] || [];
      return new Set(savedJobs);
    } catch (error) {
      console.error("Error reading saved jobs:", error);
      return new Set();
    }
  }

  async addJobsToSaved(newJobIds) {
    try {
      const result = await chrome.storage.local.get(
        this.STORAGE_KEYS.SAVED_JOBS
      );
      const savedJobs = result[this.STORAGE_KEYS.SAVED_JOBS] || [];

      // Append new job IDs to existing ones
      const updatedJobs = [...savedJobs, ...newJobIds];

      console.log(
        `Added ${newJobIds.length} new jobs. Total: ${updatedJobs.length}`
      );

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.SAVED_JOBS]: updatedJobs,
      });
    } catch (error) {
      console.error("Error adding jobs to saved:", error);
    }
  }

  async isFirstRun() {
    try {
      const result = await chrome.storage.local.get(
        this.STORAGE_KEYS.FIRST_RUN
      );
      return result[this.STORAGE_KEYS.FIRST_RUN] !== false;
    } catch (error) {
      console.error("Error reading first run data:", error);
      return true;
    }
  }

  async setFirstRunComplete() {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEYS.FIRST_RUN]: false,
      });
    } catch (error) {
      console.error("Error saving first run data:", error);
    }
  }
}
