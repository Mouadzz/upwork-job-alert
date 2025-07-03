import { useState, useEffect, useRef } from "react";

function Popup() {
  const [isRunning, setIsRunning] = useState(false);
  const [onUpworkPage, setOnUpworkPage] = useState(false);
  const [status, setStatus] = useState("Stopped");
  const [pageStatus, setPageStatus] = useState("Check page...");
  const [logs, setLogs] = useState([]);
  const consoleRef = useRef(null);

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

    // Listen for log messages from background script or content script
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
      // Keep only the last 100 logs to prevent storage bloat
      const logsToSave = logs.slice(-100);
      chrome.storage.local.set({ extensionLogs: logsToSave });
    }
  }, [logs]);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

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

  const clearLogs = () => {
    setLogs([]);
    chrome.storage.local.remove(["extensionLogs"]);
  };

  const getButtonClasses = () => {
    if (!isRunning && !onUpworkPage) {
      return "w-full bg-gray-600 text-gray-400 py-2 rounded-md font-medium text-base cursor-not-allowed";
    }

    if (isRunning) {
      return "w-full bg-gray-800 text-white py-2 rounded-md font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-gray-900 cursor-pointer";
    }

    return "w-full bg-white text-black py-2 rounded-md font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-gray-200 cursor-pointer";
  };

  return (
    <div className="w-96 h-[600px] p-0 m-0 flex flex-col">
      <div className="bg-black p-3 text-white flex-shrink-0">
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-base font-bold text-white">Upwork Tracker</h1>
        </div>

        {/* Status */}
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-2 mb-2 text-center border border-gray-600">
          <p className="text-white font-medium text-sm">{status}</p>
          <p className="text-xs mt-1 text-gray-200">{pageStatus}</p>
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

      {/* Console Section */}
      <div className="flex-1 bg-gray-900 text-white flex flex-col min-h-0">
        {/* Console Header */}
        <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-600">
          <h3 className="text-xs font-medium text-gray-200">Console</h3>
          <button
            onClick={clearLogs}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Console Content */}
        <div
          ref={consoleRef}
          className="flex-1 overflow-y-auto p-2 text-xs font-mono"
        >
          {logs.length === 0 ? (
            <div className="text-gray-500 text-center py-8 text-xs">
              No logs yet...
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="mb-1 border-b border-gray-800 pb-1 last:border-b-0"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-400 text-[10px]">
                    {log.timestamp}
                  </span>
                </div>
                <div className="text-gray-100 text-[11px] break-words">
                  {log.message}
                </div>
                {log.data && (
                  <div className="text-gray-300 text-[10px] mt-1 bg-gray-800 p-1 rounded overflow-x-auto">
                    <pre className="whitespace-pre-wrap">
                      {typeof log.data === "string"
                        ? log.data
                        : JSON.stringify(log.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Popup;
