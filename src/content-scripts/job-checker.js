function parseJobSection(section) {
  try {
    const titleElement = section.querySelector(".job-tile-title a[href]");

    if (!titleElement) {
      log("Could not find job title in section");
      return null;
    }

    // Extract job ID from href
    const href = titleElement.getAttribute("href");
    const jobIdMatch = href.match(/~(\d+)/);
    const jobId = jobIdMatch ? jobIdMatch[1] : null;

    const job = {
      id: jobId,
      title: titleElement.textContent.trim(),
    };

    // Posted time
    const postedElement = section.querySelector('[data-test="posted-on"]');
    if (postedElement) {
      job.posted = postedElement.textContent.trim();
    }

    // Job type
    const jobTypeElement = section.querySelector('[data-test="job-type"]');
    if (jobTypeElement) {
      job.jobType = jobTypeElement.textContent.trim();
    }

    // Contractor tier
    const contractorTierElement = section.querySelector(
      '[data-test="contractor-tier"]'
    );
    if (contractorTierElement) {
      job.contractorTier = contractorTierElement.textContent.trim();
    }

    // Duration
    const durationElement = section.querySelector('[data-test="duration"]');
    if (durationElement) {
      job.duration = durationElement.textContent.trim();
    }

    // Budget
    const budgetElement = section.querySelector('[data-test="budget"]');
    if (budgetElement) {
      job.budget = budgetElement.textContent.trim();
    }

    // Job description
    const descriptionElement = section.querySelector(
      '[data-test="job-description-text"]'
    );
    if (descriptionElement) {
      job.description = descriptionElement.textContent.trim();
    }

    // Skills
    const tokenContainer = section.querySelector(
      '[data-test="token-container"]'
    );
    if (tokenContainer) {
      const skillsUl = tokenContainer.querySelector("ul");
      if (skillsUl) {
        const skillLinks = skillsUl.querySelectorAll(
          'a[href*="/nx/search/jobs/?ontology_skill_uid"]'
        );
        job.skills = Array.from(skillLinks).map((link) =>
          link.textContent.trim()
        );
      }
    }

    // Payment verification status
    const paymentVerificationElement = section.querySelector(
      '[data-test="payment-verification-status"]'
    );
    if (paymentVerificationElement) {
      job.paymentVerification = paymentVerificationElement.textContent.trim();
    }

    // Feedback
    const feedbackElement = section.querySelector('[data-test="js-feedback"]');
    if (feedbackElement) {
      const srOnlyElement = feedbackElement.querySelector(".sr-only");
      if (srOnlyElement) {
        job.feedback = srOnlyElement.textContent.trim();
      }
    }

    // Client spendings
    const clientSpendingsElement = section.querySelector(
      '[data-test="client-spendings"]'
    );
    if (clientSpendingsElement) {
      job.clientSpendings = clientSpendingsElement.textContent.trim();
    }

    // Client country
    const clientCountryElement = section.querySelector(
      '[data-test="client-country"]'
    );
    if (clientCountryElement) {
      job.clientCountry = clientCountryElement.textContent.trim();
    }

    // Proposals
    const proposalsElement = section.querySelector('[data-test="proposals"]');
    if (proposalsElement) {
      job.proposals = proposalsElement.textContent.trim();
    }

    log(`Parsed job: "${job.id}"`);
    return job;
  } catch (error) {
    log(`Error parsing job, id:"${job.id}", error:${error.message}`);
    return null;
  }
}

window.checkForJobs = function checkForJobs(tabIndex) {
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

          // Parse the first job
          const firstJob = parseJobSection(jobSections[0]);

          if (firstJob) {
            log(`First job parsed successfully:`, firstJob);
          } else {
            log("Failed to parse first job");
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
