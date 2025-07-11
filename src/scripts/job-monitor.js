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

  async handleError(message) {
    console.log(`Error: ${message}`);
    console.log("⏹️ Stopping Upwork job monitoring...");

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

      // Fetch jobs from current endpoint
      console.log(`Fetching ${this.currentEndpoint}...`);

      const result = await this.apiClient.fetchJobs(
        this.currentEndpoint,
        this.bearerToken
      );

      if (!result.success) {
        await this.handleError(result.error || "Unknown error");
        return;
      }

      const jobs = result.jobs;
      const endpointName = result.endpointName;

      const newJobs = await this.compareJobs(jobs, this.currentEndpoint);

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

        // Add new jobs to saved jobs (accumulative, no duplicates)
        await this.addJobsToSaved(
          this.currentEndpoint,
          newJobs.map((job) => job.id)
        );
      }

      // Toggle endpoint for next call
      this.currentEndpoint =
        this.currentEndpoint === "bestMatch" ? "recentWork" : "bestMatch";
    } catch (error) {
      console.error("Error fetchAndProcessJobs:", error);
      await this.handleError("other", error.message);
    }
  }

  async compareJobs(jobs, endpointName) {
    const previousJobIds = await this.getSavedJobs(endpointName);

    if (await this.isFirstRun(endpointName)) {
      console.log(`First run for ${endpointName}`);
      await this.setFirstRunComplete(endpointName);
      // For first run, save all current jobs and return empty array
      await this.addJobsToSaved(
        endpointName,
        jobs.map((job) => job.id)
      );
      return [];
    }

    //jobs that weren't previously saved
    const newJobs = jobs.filter((job) => !previousJobIds.has(job.id));

    console.log(`Found ${jobs.length} jobs -> ${newJobs.length} jobs are new`);

    return newJobs;
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

  async addJobsToSaved(endpointName, newJobIds) {
    try {
      const result = await chrome.storage.local.get(
        this.STORAGE_KEYS.SAVED_JOBS
      );
      const savedJobs = result[this.STORAGE_KEYS.SAVED_JOBS] || {};

      // Get existing job IDs and append new ones
      const existingJobIds = savedJobs[endpointName] || [];
      savedJobs[endpointName] = [...existingJobIds, ...newJobIds];

      console.log(
        `Added ${newJobIds.length} new jobs to ${endpointName}. Total: ${savedJobs[endpointName].length}`
      );

      await chrome.storage.local.set({
        [this.STORAGE_KEYS.SAVED_JOBS]: savedJobs,
      });
    } catch (error) {
      console.error("Error adding jobs to saved:", error);
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
