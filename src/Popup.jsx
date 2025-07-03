import { useState, useEffect } from "react";
import ConfigSection from "./components/config-section";
import ConsoleSection from "./components/console-section";

function Popup() {
  const [isRunning, setIsRunning] = useState(false);
  const [onUpworkPage, setOnUpworkPage] = useState(false);
  const [logs, setLogs] = useState([]);

  // Configuration state with updated defaults
  const [config, setConfig] = useState({
    MAX_MINUTES_OLD: 5,
    MIN_CLIENT_SPENDING: 10, // Changed from 0 to 10
    REQUIRE_PAYMENT_VERIFICATION: false,
    EXCLUDED_COUNTRIES: "India, Pakistan, Bangladesh", // Added default countries
    SWITCH_INTERVAL: 10000,
    WAIT_AFTER_SWITCH: 5000,
  });

  useEffect(() => {
    // Check current status from storage
    chrome.storage.local.get(["isRunning"], (data) => {
      const running = data.isRunning || false;
      setIsRunning(running);
    });

    // Check if on correct Upwork page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const onCorrectPage = tabs[0].url.includes(
        "https://www.upwork.com/nx/find-work"
      );
      setOnUpworkPage(onCorrectPage);
    });

    // Listen for log messages
    const messageListener = (message, sender, sendResponse) => {
      if (message.type === "LOG") {
        const timestamp = new Date().toLocaleTimeString();
        const newLog = {
          id: Date.now(),
          timestamp,
          message: message.message,
          data: message.data,
        };
        setLogs((prevLogs) => [...prevLogs, newLog]);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Load existing logs from storage
    chrome.storage.local.get(["extensionLogs"], (data) => {
      if (data.extensionLogs && Array.isArray(data.extensionLogs)) {
        setLogs(data.extensionLogs);
      }
    });

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  // Save logs to storage whenever logs change
  useEffect(() => {
    if (logs.length > 0) {
      const logsToSave = logs.slice(-100);
      chrome.storage.local.set({ extensionLogs: logsToSave });
    }
  }, [logs]);

  const handleConfigChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggle = () => {
    if (isRunning) {
      // Stop monitoring
      chrome.runtime.sendMessage({ type: "STOP" });
      setIsRunning(false);
      chrome.storage.local.set({ isRunning: false });
    } else {
      // Start monitoring (only if on correct Upwork page)
      if (!onUpworkPage) {
        return;
      }

      // Parse excluded countries from comma-separated string to array
      const configToSend = {
        ...config,
        EXCLUDED_COUNTRIES: config.EXCLUDED_COUNTRIES.split(",")
          .map((country) => country.trim())
          .filter((country) => country.length > 0),
      };

      chrome.runtime.sendMessage({
        type: "START",
        config: configToSend,
      });
      setIsRunning(true);
      chrome.storage.local.set({ isRunning: true });
    }
  };

  const clearLogs = () => {
    setLogs([]);
    chrome.storage.local.remove(["extensionLogs"]);
  };

  const getButtonClasses = () => {
    if (!isRunning && !onUpworkPage) {
      return "w-full bg-gray-600 text-gray-400 py-2 rounded-md font-medium text-base cursor-not-allowed";
    }

    if (isRunning) {
      return "w-full bg-gray-300 text-white py-2 rounded-md font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-gray-900 cursor-pointer";
    }

    return "w-full bg-white text-black py-2 rounded-md font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-gray-200 cursor-pointer";
  };

  return (
    <div className="w-[500px] h-[600px] p-0 m-0 flex flex-col">
      <div className="bg-gray-900 p-3 text-white flex-shrink-0">
        <h1 className="text-lg font-bold text-white text-center">
          Upwork Tracker
        </h1>
      </div>
      <ConfigSection config={config} onConfigChange={handleConfigChange} />
      <div className="bg-gray-900 p-3 text-white flex-shrink-0 flex justify-center">
        <div className="w-2/3">
          <button
            onClick={handleToggle}
            disabled={!isRunning && !onUpworkPage}
            className={getButtonClasses()}
          >
            {isRunning ? "Stop" : "Start"}
          </button>
        </div>
      </div>
      <ConsoleSection logs={logs} onClearLogs={clearLogs} />
    </div>
  );
}

export default Popup;
