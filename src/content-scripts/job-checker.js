let firstJobIdBestMatch = null;
let firstJobIdMostRecent = null;
let isFirstRunBestMatch = true;
let isFirstRunMostRecent = true;

function checkForNewJobs(tabIndex, currentJobs) {
  const tabName = tabIndex === 0 ? "Best Match" : "Most Recent";
  const savedFirstJobId =
    tabIndex === 0 ? firstJobIdBestMatch : firstJobIdMostRecent;
  const isFirstRun =
    tabIndex === 0 ? isFirstRunBestMatch : isFirstRunMostRecent;

  if (currentJobs.length === 0) {
    log(`No jobs found in ${tabName}`);
    return [];
  }

  // If first run, just save the first job ID and return empty array
  if (isFirstRun) {
    log(`First run for ${tabName} - baseline set`);
    if (tabIndex === 0) {
      firstJobIdBestMatch = currentJobs[0].id;
      isFirstRunBestMatch = false;
    } else {
      firstJobIdMostRecent = currentJobs[0].id;
      isFirstRunMostRecent = false;
    }
    return []; // No new jobs on first run
  }

  // Find where our previously saved first job is in the current list
  const savedJobIndex = currentJobs.findIndex(
    (job) => job.id === savedFirstJobId
  );

  if (savedJobIndex === -1) {
    // Our saved first job is not in the list anymore
    // Be conservative - only take the first job as new to avoid sending old ones
    log(`Previous baseline not found in ${tabName} - conservative approach`);
    const newJobs = [currentJobs[0]]; // Only first job as new

    // Update saved first job
    if (tabIndex === 0) {
      firstJobIdBestMatch = currentJobs[0].id;
    } else {
      firstJobIdMostRecent = currentJobs[0].id;
    }

    return newJobs;
  }

  if (savedJobIndex === 0) {
    log("No new jobs - the same job is still first");
    return [];
  }

  // New jobs are everything BEFORE our saved first job
  const newJobs = currentJobs.slice(0, savedJobIndex);
  log(`Found ${newJobs.length} new jobs in ${tabName}`);

  // Update saved first job to the new first job
  if (tabIndex === 0) {
    firstJobIdBestMatch = currentJobs[0].id;
  } else {
    firstJobIdMostRecent = currentJobs[0].id;
  }

  return newJobs;
}

window.findJobs = function (tabIndex) {
  const tabName = tabIndex === 0 ? "Best Match" : "Most Recent";
  const feedSelector =
    tabIndex === 0
      ? '[data-test="feed-best-match"]'
      : '[data-test="feed-most-recent"]';
  const startTime = Date.now();
  const timeout = 10000;
  const pollInterval = 500;

  function waitForJobTileList() {
    const feedContainer = document.querySelector(feedSelector);

    if (feedContainer) {
      const jobTileList = feedContainer.querySelector(
        '[data-test="job-tile-list"]'
      );

      if (jobTileList) {
        const jobSections = jobTileList.querySelectorAll("section");

        if (jobSections.length > 0) {
          // Parse ALL jobs
          const allJobs = [];
          for (let i = 0; i < jobSections.length; i++) {
            const job = parseJobSection(jobSections[i]);
            if (job) {
              allJobs.push(job);
            }
          }

          log(`Found ${jobSections.length} jobs in ${tabName} tab`);

          // Check for new jobs
          const newJobs = checkForNewJobs(tabIndex, allJobs);

          if (newJobs.length > 0) {
            // Apply filters here
            const filteredJobs = window.filterJobs(newJobs);

            if (filteredJobs.length > 0) {
              log(`🚀 Sending ${filteredJobs.length} new jobs to Telegram`);
              sendJobsToTelegram(tabIndex, filteredJobs);
            } else {
              log(`No jobs passed the filters`);
            }
          }

          return;
        }
      }
    }

    if (Date.now() - startTime > timeout) {
      log(`Timeout: Job tile list not found in ${tabName} tab`);
      return;
    }

    setTimeout(waitForJobTileList, pollInterval);
  }

  waitForJobTileList();
};
