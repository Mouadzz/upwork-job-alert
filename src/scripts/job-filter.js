import { countryCodeToName } from "./countrycode-to-name.js";

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
      (job.client?.totalSpent === null ||
        job.client?.totalSpent === undefined ||
        job.client?.totalSpent < config.minClientSpending)
    ) {
      return false;
    }

    function normalizeCountry(country) {
      if (!country) return "";
      const normalized = country.toLowerCase().trim();
      // Check if it's a country code first
      return countryCodeToName[country.toUpperCase()] || normalized;
    }

    // Check excluded countries
    if (config.excludedCountries && config.excludedCountries.trim()) {
      const excludedList = config.excludedCountries
        .split(",")
        .map((country) => normalizeCountry(country))
        .filter((country) => country.length > 0);

      const clientCountry = job.client?.location?.country;
      const normalizedClientCountry = normalizeCountry(clientCountry);

      if (
        normalizedClientCountry &&
        excludedList.includes(normalizedClientCountry)
      ) {
        return false;
      }
    }

    return true;
  });

  console.log(`${filteredJobs.length} jobs passed filters`);
  return filteredJobs;
}
