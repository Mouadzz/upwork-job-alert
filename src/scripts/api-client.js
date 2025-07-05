export class ApiClient {
  constructor() {
    this.baseUrl = "https://www.upwork.com/api/graphql/v1";

    this.bestMatchQuery =
      '{"query":"\\n  query bestMatches {\\n    bestMatchJobsFeed(limit: 30) {\\n      results {\\n        id\\n        title\\n        ciphertext\\n        description\\n        type\\n        recno\\n        freelancersToHire\\n        duration\\n        durationLabel\\n        engagement\\n        amount {\\n          amount\\n          currencyCode\\n        }\\n        createdOn:createdDateTime\\n        publishedOn:publishedDateTime\\n        renewedOn:renewedDateTime\\n        prefFreelancerLocation\\n        prefFreelancerLocationMandatory\\n        connectPrice\\n        client {\\n          totalHires\\n          totalSpent\\n          paymentVerificationStatus\\n          location {\\n            country\\n            city\\n            state\\n            countryTimezone\\n            worldRegion\\n          }\\n          totalReviews\\n          totalFeedback\\n          hasFinancialPrivacy\\n        }\\n        enterpriseJob\\n        premium\\n        jobTime\\n        skills {\\n          id\\n          prefLabel\\n        }\\n        tierText\\n        tier\\n        tierLabel\\n        proposalsTier\\n        isApplied\\n        hourlyBudget {\\n          type\\n          min\\n          max\\n        }\\n        weeklyBudget {\\n          amount\\n        }\\n        clientRelation {\\n          companyName\\n          lastContractRid\\n          lastContractTitle\\n        }\\n        relevanceEncoded\\n        attrs {\\n          uid:id\\n          prettyName\\n          freeText\\n          skillType\\n        }\\n      }\\n      paging {\\n        total\\n        count\\n        minTime\\n        maxTime\\n      }\\n    }\\n  }\\n","variables":{"fromTime":0,"toTime":30}}';

    this.recentWorkQuery =
      '{"query":"\\n  query($limit: Int, $toTime: String) {\\n    mostRecentJobsFeed(limit: $limit, toTime: $toTime) {\\n      results {\\n        id\\n        title\\n        ciphertext\\n        description\\n        type\\n        recno\\n        freelancersToHire\\n        duration\\n        engagement\\n        amount {\\n          amount\\n        }\\n        createdOn:createdDateTime\\n        publishedOn:publishedDateTime\\n        prefFreelancerLocationMandatory\\n        connectPrice\\n        client {\\n          totalHires\\n          totalSpent\\n          paymentVerificationStatus\\n          location {\\n            country\\n          }\\n          totalReviews\\n          totalFeedback\\n          hasFinancialPrivacy\\n        }\\n        tierText\\n        tier\\n        tierLabel\\n        proposalsTier\\n        enterpriseJob\\n        premium\\n        jobTs:jobTime\\n        attrs:skills {\\n          id\\n          uid:id\\n          prettyName:prefLabel\\n          prefLabel\\n        }\\n        hourlyBudget {\\n          type\\n          min\\n          max\\n        }\\n        isApplied\\n      }\\n      paging {\\n        total\\n        count\\n        resultSetTs:minTime\\n        maxTime\\n      }\\n    }\\n  }\\n","variables":{"limit":10}}';
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
        return { success: false, authError: true };
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
        authError: false,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        authError: false,
      };
    }
  }
}
