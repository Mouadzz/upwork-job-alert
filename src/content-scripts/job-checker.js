console.log("job-checker.js loaded");

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
    return [];
  }

  // If first run, just save the first job ID and return empty array
  if (isFirstRun) {
    log(`First run for ${tabName} - saving first job ID as baseline`);
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
    // Our saved first job is not in the list anymore (page changed a lot)
    // Consider all jobs as potentially new, but save new first job
    log(`Previous first job not found in ${tabName}, treating all as new`);
    const newJobs = currentJobs.slice(); // All jobs are new

    // Update saved first job
    if (tabIndex === 0) {
      firstJobIdBestMatch = currentJobs[0].id;
    } else {
      firstJobIdMostRecent = currentJobs[0].id;
    }

    return newJobs;
  }

  if (savedJobIndex === 0) {
    // No new jobs - the same job is still first
    log(`No new jobs found in ${tabName}`);
    return [];
  }

  // New jobs are everything BEFORE our saved first job (index 0 to savedJobIndex-1)
  const newJobs = currentJobs.slice(0, savedJobIndex);

  // Update saved first job to the new first job
  if (tabIndex === 0) {
    firstJobIdBestMatch = currentJobs[0].id;
  } else {
    firstJobIdMostRecent = currentJobs[0].id;
  }

  log(`Found ${newJobs.length} new jobs in ${tabName}`);
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
          log(`Found ${jobSections.length} jobs in ${tabName} tab`);

          // Parse ALL jobs
          const allJobs = [];
          for (let i = 0; i < jobSections.length; i++) {
            const job = parseJobSection(jobSections[i]);
            if (job) {
              allJobs.push(job);
            }
          }

          log(`Successfully parsed ${allJobs.length} jobs from ${tabName}`);

          // Check for new jobs
          const newJobs = checkForNewJobs(tabIndex, allJobs);

          if (newJobs.length > 0) {
            log(`🔥 NEW JOBS DETECTED in ${tabName}:`, newJobs);
            sendJobsToTelegram(tabIndex, newJobs);
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
