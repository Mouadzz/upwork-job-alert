let MAX_MINUTES_OLD = 5;
let MIN_CLIENT_SPENDING = 0;
let REQUIRE_PAYMENT_VERIFICATION = false;
let EXCLUDED_COUNTRIES = [];

// Function to initialize configuration
window.initJobFilterConfig = function (config) {
  MAX_MINUTES_OLD = config.MAX_MINUTES_OLD || 5;
  MIN_CLIENT_SPENDING = config.MIN_CLIENT_SPENDING || 0;
  REQUIRE_PAYMENT_VERIFICATION = config.REQUIRE_PAYMENT_VERIFICATION || false;
  EXCLUDED_COUNTRIES = config.EXCLUDED_COUNTRIES || [];

  log(`Job filter initialized with config:`, {
    MAX_MINUTES_OLD,
    MIN_CLIENT_SPENDING,
    REQUIRE_PAYMENT_VERIFICATION,
    EXCLUDED_COUNTRIES,
  });
};

function isJobTooOld(postedText) {
  if (!postedText) return true; // If no posted time, consider it too old

  const text = postedText.toLowerCase();

  // If it contains "hour" or "hours", it's too old
  if (text.includes("hour")) {
    return true;
  }

  // If it contains "minute" or "minutes", check the number
  if (text.includes("minute")) {
    const minuteMatch = text.match(/(\d+)\s*minutes?/);
    if (minuteMatch) {
      const minutes = parseInt(minuteMatch[1]);
      return minutes > MAX_MINUTES_OLD;
    }
    return true; // If we can't parse minutes, consider it too old
  }

  // If it contains "second" or "seconds", it's fresh
  if (text.includes("second")) {
    return false;
  }

  // If none of the above, consider it too old
  return true;
}

function parseClientSpending(spendingText) {
  if (!spendingText) return 0;

  // Remove currency symbols and extract number
  const match = spendingText.match(/[\d,]+/);
  if (match) {
    return parseInt(match[0].replace(/,/g, ""));
  }
  return 0;
}

function shouldExcludeJob(job) {
  // Check if job is too old
  if (isJobTooOld(job.posted)) {
    log(`Job "${job.title}" is too old: ${job.posted}`);
    return true;
  }

  // Check client spending
  if (MIN_CLIENT_SPENDING > 0) {
    const clientSpending = parseClientSpending(job.clientSpendings);
    if (clientSpending < MIN_CLIENT_SPENDING) {
      log(
        `Job "${job.title}" - client spending too low: ${job.clientSpendings}`
      );
      return true;
    }
  }

  // Check payment verification
  if (REQUIRE_PAYMENT_VERIFICATION) {
    if (
      !job.paymentVerification ||
      job.paymentVerification.toLowerCase().includes("unverified")
    ) {
      log(
        `Job "${job.title}" - payment not verified: ${job.paymentVerification}`
      );
      return true;
    }
  }

  // Check excluded countries
  if (EXCLUDED_COUNTRIES.length > 0 && job.clientCountry) {
    const isExcluded = EXCLUDED_COUNTRIES.some((country) =>
      job.clientCountry.toLowerCase().includes(country.toLowerCase())
    );
    if (isExcluded) {
      log(
        `Job "${job.title}" - client from excluded country: ${job.clientCountry}`
      );
      return true;
    }
  }

  return false;
}

window.filterJobs = function (jobs) {
  const filteredJobs = jobs.filter((job) => !shouldExcludeJob(job));
  log(
    `After filtering: ${filteredJobs.length} jobs remain out of ${jobs.length}`
  );
  return filteredJobs;
};
