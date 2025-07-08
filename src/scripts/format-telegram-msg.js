export function formatTelegramJobMessage(job, tabName) {
  let message = `🗂 ${tabName}\n\n`;
  message += `💼 ${job.title || "No Title"}\n\n`;

  // Posted date
  if (job.publishedOn) {
    const date = new Date(job.publishedOn);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds

    let timeAgo = "";
    if (diff < 60) {
      timeAgo = `${diff} seconds ago`;
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      timeAgo = `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      timeAgo = `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else {
      const days = Math.floor(diff / 86400);
      timeAgo = `${days} day${days !== 1 ? "s" : ""} ago`;
    }

    message += `🕒 Posted: _${timeAgo}_\n`;
  }

  // Connect Price
  if (job.connectPrice) {
    message += `🪙 Connect Price: _${job.connectPrice} connects_\n`;
  }

  // Budget
  if (job.type === 1 && job.amount?.amount && job.amount.amount !== 0.0) {
    // Fixed price job
    message += `💰 Budget: _${job.amount.amount}$_\n`;
  } else if (job.type === 2 && job.hourlyBudget?.min && job.hourlyBudget?.max) {
    // Hourly job
    message += `💰 Budget: _$${job.hourlyBudget.min} - $${job.hourlyBudget.max} / hr_\n`;
  }

  // Proposals
  if (job.proposalsTier) {
    message += `📬 Proposals: _${job.proposalsTier}_\n`;
  }

  // Duration
  if (job.duration) {
    message += `⏳ Duration: _${job.duration}_\n`;
  }

  // Contractor tier
  if (job.tierText) {
    message += `⚙️ Level: _${job.tierText}_\n`;
  }

  // Job type
  if (job.type) {
    const typeLabel =
      job.type === 1 ? "Fixed price" : job.type === 2 ? "Hourly" : "Unknown";
    message += `📄 Type: _${typeLabel}_\n`;
  }

  if (job.client) {
    const client = job.client;

    // Country
    if (client.location?.country) {
      message += `\n🌍 Country: _${client.location.country}_\n`;
    }

    // Spending
    if (client.totalSpent !== undefined && client.totalSpent !== null) {
      const spentNum = parseFloat(client.totalSpent || 0);
      let formattedSpent = `$${spentNum}`;

      if (spentNum >= 1_000_000) {
        formattedSpent = `$${(spentNum / 1_000_000)
          .toFixed(1)
          .replace(/\.0$/, "")}M`;
      } else if (spentNum >= 1_000) {
        formattedSpent = `$${(spentNum / 1_000)
          .toFixed(1)
          .replace(/\.0$/, "")}k`;
      }

      message += `💳 Total Spent: _${formattedSpent}_\n`;
    }

    // Payment verification
    if (client.paymentVerificationStatus !== undefined) {
      const verified =
        client.paymentVerificationStatus === 1
          ? "✅ Payment verified"
          : "❌ Payment not verified";
      message += `${verified}\n`;
    }

    // Additional client info
    if (client.totalHires) {
      message += `👥 Total Hires: _${client.totalHires}_\n`;
    }

    if (client.totalReviews) {
      message += `📝 Reviews: _${client.totalReviews}_\n`;
    }

    if (client.totalFeedback) {
      message += `⭐️ Feedback Score: _${client.totalFeedback}_\n`;
    }
  }

  // Skills (from `attrs`)
  if (job.attrs && job.attrs.length > 0) {
    const skillNames = job.attrs
      .filter((attr) => attr.prettyName)
      .slice(0, 6)
      .map((attr) => attr.prettyName)
      .join(", ");
    message += `\n🛠 Skills: _${skillNames}${
      job.attrs.length > 6 ? "..." : ""
    }_\n`;
  }

  // Description
  if (job.description) {
    message += `\n📝 Description:\n`;
    message += `_${job.description.trim().substring(0, 500)}${
      job.description.length > 500 ? "..." : ""
    }_\n`;
  }

  // Job link
  if (job.ciphertext) {
    message += `\n🔗 Link: https://www.upwork.com/jobs/${job.ciphertext}`;
  }

  return message;
}
