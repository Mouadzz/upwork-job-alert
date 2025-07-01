import { useState, useEffect } from "react";

function Popup() {
  const [isRunning, setIsRunning] = useState(false);
  const [onUpworkPage, setOnUpworkPage] = useState(false);
  const [status, setStatus] = useState("Stopped");
  const [pageStatus, setPageStatus] = useState("Check page...");

  useEffect(() => {
    // Check current status from storage
    chrome.storage.local.get(["isRunning"], (data) => {
      const running = data.isRunning || false;
      setIsRunning(running);
      setStatus(running ? "Running" : "Stopped");
    });

    // Check if on Upwork page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const onUpwork = tabs[0].url.includes("upwork.com");
      setOnUpworkPage(onUpwork);
      setPageStatus(onUpwork ? "On Upwork page ✓" : "Not on Upwork page ✗");
    });
  }, []);

  const handleToggle = () => {
    if (isRunning) {
      // Stop monitoring
      setStatus("Stopping...");
      chrome.runtime.sendMessage({ type: "STOP" });
      setIsRunning(false);
      chrome.storage.local.set({ isRunning: false });
      setTimeout(() => setStatus("Stopped"), 500);
    } else {
      // Start monitoring (only if on Upwork page)
      if (!onUpworkPage) {
        setStatus("Go to Upwork first!");
        setTimeout(() => setStatus("Stopped"), 2000);
        return;
      }

      setStatus("Starting...");
      chrome.runtime.sendMessage({ type: "START" });
      setIsRunning(true);
      chrome.storage.local.set({ isRunning: true });
      setTimeout(() => setStatus("Running"), 500);
    }
  };

  const getButtonClasses = () => {
    if (!isRunning && !onUpworkPage) {
      return "w-full bg-gray-600 text-gray-400 py-3 rounded-md font-semibold text-lg cursor-not-allowed";
    }

    if (isRunning) {
      return "w-full bg-gray-800 text-white py-3 rounded-md font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-gray-900 cursor-pointer";
    }

    return "w-full bg-white text-black py-3 rounded-md font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-gray-200 cursor-pointer";
  };

  return (
    <div className="w-80 p-0 m-0">
      <div className="bg-black p-6 text-white">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white">Upwork Tracker</h1>
        </div>

        {/* Status */}
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-4 mb-4 text-center border border-gray-600">
          <p className="text-white font-semibold text-lg">{status}</p>
          <p className="text-base mt-2 text-gray-200">{pageStatus}</p>
        </div>

        {/* Single Toggle Button */}
        <button
          onClick={handleToggle}
          disabled={!isRunning && !onUpworkPage}
          className={getButtonClasses()}
        >
          {isRunning ? "Stop" : "Start"}
        </button>
      </div>
    </div>
  );
}

export default Popup;
