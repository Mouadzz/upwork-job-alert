export function filterJobs(jobs, config) {
  const filteredJobs = jobs.filter((job) => {
    // Check job age
    if (config.maxJobAge > 0 && job.publishedOn) {
      const jobAge =
        (Date.now() - new Date(job.publishedOn).getTime()) / (1000 * 60); // in minutes
      if (jobAge > config.maxJobAge) {
        return false;
      }
    }

    // Check payment verification (1 = VERIFIED)
    if (
      config.requirePaymentVerification &&
      job.client?.paymentVerificationStatus !== 1
    ) {
      return false;
    }

    // Check minimum client spending
    if (
      config.minClientSpending > 0 &&
      (job.client?.totalSpent || 0) < config.minClientSpending
    ) {
      return false;
    }

    // Check excluded countries
    if (config.excludedCountries && config.excludedCountries.trim()) {
      const excludedList = config.excludedCountries
        .split(",")
        .map((country) => country.trim().toLowerCase())
        .filter((country) => country.length > 0);

      const clientCountry = job.client?.location?.country?.toLowerCase();
      if (clientCountry && excludedList.includes(clientCountry)) {
        return false;
      }
    }

    return true;
  });

  console.log(`${filteredJobs.length} jobs passed filters`);
  return filteredJobs;
}
