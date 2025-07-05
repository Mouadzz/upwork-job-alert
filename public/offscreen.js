chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "PLAY_SOUND") {
    const audio = new Audio("sounds/notification.mp3");
    audio.play();
  }
});
