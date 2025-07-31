export function parseJobs(data, endpointName) {
  let rawJobs = [];

  if (endpointName === "bestMatch") {
    rawJobs = data.data?.bestMatchJobsFeed?.results || [];
  } else if (endpointName === "myFeed") {
    rawJobs = data.data?.userSavedSearches?.results || [];
  } else {
    rawJobs = data.data?.mostRecentJobsFeed?.results || [];
  }

  function parseNumericValue(value) {
    if (typeof value === "number") return value;
    if (typeof value === "string") return parseFloat(value) || 0;
    return 0;
  }

  function normalizeJobType(type) {
    if (typeof type === "number") return type;
    if (type === "FIXED") return 1;
    if (type === "HOURLY") return 2;
    return type;
  }

  function normalizeDuration(duration) {
    if (!duration) return duration;
    if (duration === "MONTH") return "Less than 1 month";
    if (duration === "MONTHS_3") return "1 to 3 months";
    if (duration === "MONTHS_6") return "3 to 6 months";
    if (duration === "MONTHS_6_PLUS") return "More than 6 months";
    return duration;
  }

  return rawJobs.map((job) => {
    const amount =
      endpointName === "myFeed" ? job.amount?.displayValue : job.amount?.amount;

    const totalSpent =
      endpointName === "myFeed"
        ? job.client?.totalSpent?.displayValue
        : job.client?.totalSpent;

    return {
      id: job.id,
      title: job.title,
      ciphertext: job.ciphertext,
      description: job.description,
      type: normalizeJobType(job.type),
      duration: normalizeDuration(job.duration),
      amount: parseNumericValue(amount),
      publishedOn: job.publishedOn,
      connectPrice: job.connectPrice,
      client: {
        totalHires: job.client?.totalHires,
        totalSpent: parseNumericValue(totalSpent),
        paymentVerificationStatus: job.client?.paymentVerificationStatus,
        location: job.client?.location,
        totalReviews: job.client?.totalReviews,
        totalFeedback: job.client?.totalFeedback,
      },
      tierText:
        endpointName === "myFeed" ? job.contractorTier : job.tierText || null,
      proposalsTier: job.proposalsTier,
      skills:
        endpointName === "myFeed"
          ? job.skills?.map((s) => s.prettyName) || []
          : job.attrs?.map((a) => a.prettyName) || [],
      hourlyBudget: job.hourlyBudget,
    };
  });
}
