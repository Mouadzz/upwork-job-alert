window.log = function (message, data) {
  if (data && typeof data === "object") {
    console.log(`[UPWORK-TRACKER] ${message}`);
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(`[UPWORK-TRACKER] ${message}`);
  }
};
