export class ApiClient {
  constructor() {
    this.baseUrl = "https://www.upwork.com/api/graphql/v1";

    this.bestMatchQuery =
      '{"query":"\\n  query bestMatches {\\n    bestMatchJobsFeed(limit: 30) {\\n      results {\\n        id\\n        title\\n        ciphertext\\n        description\\n        type\\n        duration\\n        amount {\\n          amount\\n        }\\n        publishedOn:publishedDateTime\\n        connectPrice\\n        client {\\n          totalHires\\n          totalSpent\\n          paymentVerificationStatus\\n          location {\\n            country\\n          }\\n          totalReviews\\n          totalFeedback\\n        }\\n        tierText\\n        proposalsTier\\n        attrs {\\n          prettyName\\n        }\\n        hourlyBudget {\\n          min\\n          max\\n        }\\n      }\\n    }\\n  }\\n","variables":{"fromTime":0,"toTime":30}}';

    this.recentWorkQuery =
      '{"query":"\\n  query($limit: Int, $toTime: String) {\\n    mostRecentJobsFeed(limit: $limit, toTime: $toTime) {\\n      results {\\n        id\\n        title\\n        ciphertext\\n        description\\n        type\\n        duration\\n        amount {\\n          amount\\n        }\\n        publishedOn:publishedDateTime\\n        connectPrice\\n        client {\\n          totalHires\\n          totalSpent\\n          paymentVerificationStatus\\n          location {\\n            country\\n          }\\n          totalReviews\\n          totalFeedback\\n        }\\n        tierText\\n        proposalsTier\\n        attrs:skills {\\n          prettyName:prefLabel\\n        }\\n        hourlyBudget {\\n          min\\n          max\\n        }\\n      }\\n    }\\n  }\\n","variables":{"limit":10}}';
  }

  async fetchJobs(endpointName, bearerToken) {
    const requestBody =
      endpointName === "bestMatch" ? this.bestMatchQuery : this.recentWorkQuery;

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          authorization: `bearer ${bearerToken}`,
          "content-type": "application/json",
          priority: "u=1, i",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "none",
          "sec-fetch-storage-access": "active",
          "x-requested-with": "XMLHttpRequest",
        },
        referrer: "https://www.upwork.com/nx/find-work/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: requestBody,
      });

      // Handle auth errors
      if (response.status === 401) {
        return { success: false, error: "Authentication failed" };
      }

      // Handle other HTTP status errors
      if (!response.ok) {
        return {
          success: false,
          error: `Status -> ${result.statusCode}: ${result.statusText}`,
        };
      }

      const data = await response.json();

      const jobs =
        endpointName === "bestMatch"
          ? data.data?.bestMatchJobsFeed?.results || []
          : data.data?.mostRecentJobsFeed?.results || [];

      return {
        success: true,
        jobs: jobs,
        endpointName:
          endpointName === "bestMatch" ? "Best Match" : "Recent Work",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
