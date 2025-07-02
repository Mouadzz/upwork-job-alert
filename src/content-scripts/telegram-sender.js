console.log("telegram-sender.js loaded");

const BOT_TOKEN = import.meta.env.VITE_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_CHAT_ID;

function formatJobMessage(job, tabName) {
  let message = `🗂 *${tabName}*\n\n`;

  message += `💼 *${job.title || "No Title"}*\n\n`;

  if (job.posted) {
    message += `🕒 Posted: _${job.posted}_\n`;
  }

  if (job.budget) {
    message += `💰 Budget: _${job.budget}_\n`;
  }

  if (job.jobType) {
    message += `📄 Type: _${job.jobType}_\n`;
  }

  if (job.duration) {
    message += `⏳ Duration: _${job.duration}_\n`;
  }

  if (job.contractorTier) {
    message += `⚙️ Level: _${job.contractorTier}_\n`;
  }

  if (job.proposals) {
    message += `📬 Proposals: _${job.proposals}_\n`;
  }

  if (job.clientCountry) {
    message += `🌍 Country: _${job.clientCountry}_\n`;
  }

  if (job.clientSpendings) {
    const cleanSpent = job.clientSpendings.replace(/\n/g, " ").trim();
    message += `💳 Client Spent: _${cleanSpent}_`;
  }

  if (job.paymentVerification) {
    message += ` • _${job.paymentVerification}_\n`;
  }

  if (job.skills && job.skills.length > 0) {
    message += `🛠 Skills: _${job.skills.join(", ")}_\n`;
  }

  if (job.description) {
    message += `\n📝 *Description:*\n`;
    message += `_${job.description.trim().substring(0, 800)}${
      job.description.length > 800 ? "..." : ""
    }_\n`;
  }

  if (job.id) {
    message += `\nLink: https://www.upwork.com/jobs/~${job.id}`;
  }

  return message;
}

window.sendJobsToTelegram = function (tabIndex, newJobs) {
  if (!newJobs || newJobs.length === 0) return;

  const tabName = tabIndex === 0 ? "Best Match" : "Most Recent";

  newJobs.forEach((job, index) => {
    setTimeout(() => {
      const message = formatJobMessage(job, tabName);

      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
      })
        .then((response) => {
          if (response.ok) {
            log(`✅ Job sent to Telegram: ${job.title}`);
          } else {
            log(`❌ Failed to send job: ${job.title}`);
          }
        })
        .catch((error) => {
          log(`❌ Telegram error: ${error.message}`);
        });
    }, index * 1000); // 1 second delay between each job
  });
};
