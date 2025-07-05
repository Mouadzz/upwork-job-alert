import { useState, useEffect } from "react";
import { Play, Square, Bell, Send, CircleX } from "lucide-react";

const Popup = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({
    requirePaymentVerification: false,
    minClientSpending: 0,
    excludedCountries: "India, Pakistan, Bangladesh",
    fetchInterval: 20,
    chromeNotifications: true,
    telegramNotifications: true,
    maxJobAge: 5,
  });

  // Check if monitoring is running on component mount
  useEffect(() => {
    checkRunningStatus();

    // Listen for status changes from background
    const messageListener = (message, sender, sendResponse) => {
      if (message.action === "statusChanged") {
        setIsRunning(message.isRunning);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const checkRunningStatus = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "isRunning",
      });

      if (response.success) {
        setIsRunning(response.isRunning);
      }
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  const getTokenInfo = async () => {
    try {
      const cookies = await chrome.cookies.getAll({ domain: ".upwork.com" });
      const authCookies = cookies.filter(
        (cookie) =>
          cookie.path === "/nx/find-work/" &&
          cookie.value.startsWith("oauth2v2_")
      );

      if (authCookies.length === 0) {
        return null;
      }

      // Get the cookie with the latest expiration date (newest token)
      const latestAuthCookie = authCookies.reduce((latest, current) => {
        return current.expirationDate > latest.expirationDate
          ? current
          : latest;
      });

      return {
        token: latestAuthCookie.value,
        expiry: new Date(latestAuthCookie.expirationDate * 1000).toISOString(),
      };
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  const validateConfig = () => {
    // Check fetch interval
    if (
      !config.fetchInterval ||
      config.fetchInterval === "" ||
      config.fetchInterval < 20
    ) {
      setError(
        "Fetch interval must be at least 20 seconds to avoid spamming Upwork's servers. \nWe recommend 30 seconds or more for better reliability."
      );
      return false;
    }

    // Check max job age (0 is allowed - means no age filter)
    if (config.maxJobAge < 0) {
      setError("Job age filter cannot be negative.");
      return false;
    }

    // Check min client spending
    if (config.minClientSpending < 0) {
      setError("Min client spending cannot be negative.");
      return false;
    }

    return true;
  };

  const handleStart = async () => {
    setError(null);

    // Validate configuration first
    if (!validateConfig()) {
      return;
    }

    // Get fresh token
    const tokenInfo = await getTokenInfo();

    if (!tokenInfo) {
      setError("You are not logged in. Please log in to Upwork and try again.");
      return;
    }

    // Check if token is expired
    if (new Date() >= new Date(tokenInfo.expiry)) {
      setError(
        "Your login session has expired. Please log in to Upwork again."
      );
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: "start",
        config: config,
        bearerToken: tokenInfo.token,
        tokenExpiry: tokenInfo.expiry,
      });

      if (response.success) {
        setIsRunning(true);
        setError(null);
      } else {
        setError("Failed to start monitoring. Please try again.");
      }
    } catch (error) {
      console.error("Error starting:", error);
      setError("Failed to start monitoring. Please try again.");
    }
  };

  const handleStop = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: "stop" });
      if (response.success) {
        setIsRunning(false);
        setError(null);
      }
    } catch (error) {
      console.error("Error stopping:", error);
    }
  };

  const handleConfigChange = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Secure number input handler
  const handleNumberInput = (key, value, min = 0) => {
    // Remove any non-numeric characters
    const cleanValue = value.replace(/[^0-9]/g, "");

    // If empty, don't change anything (let user type)
    if (cleanValue === "") {
      handleConfigChange(key, "");
      return;
    }

    const numValue = parseInt(cleanValue);

    // For fetch interval, enforce minimum of 20 but allow typing
    if (key === "fetchInterval") {
      // Allow any number to be typed, but validate on start
      handleConfigChange(key, numValue);
    } else if (numValue < min) {
      handleConfigChange(key, min);
    } else {
      handleConfigChange(key, numValue);
    }
  };

  return (
    <div className="w-80 bg-gray-900 text-white p-6 font-sans">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-blue-400 mb-2">
          Upwork Job Alert
        </h1>
        <p className="text-xs text-gray-400 leading-relaxed">
          Alternates between Best Match and Most Recent feeds every interval
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-2 bg-red-900 border border-red-700 rounded-lg flex items-start space-x-2">
          <span className="text-xs text-red-100">{error}</span>
        </div>
      )}

      {/* Configuration */}
      <div className="space-y-4 mb-6">
        {/* Payment Verification */}
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.requirePaymentVerification}
            onChange={(e) =>
              handleConfigChange("requirePaymentVerification", e.target.checked)
            }
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span className="text-xs">Require Payment Verification</span>
        </label>

        {/* Min Client Spending */}
        <div>
          <label className="block text-xs text-gray-300 mb-1">
            Min Client Spending ($)
          </label>
          <input
            type="text"
            value={config.minClientSpending}
            onChange={(e) =>
              handleNumberInput("minClientSpending", e.target.value, 0)
            }
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            placeholder="0"
          />
        </div>

        {/* Excluded Countries */}
        <div>
          <label className="block text-xs text-gray-300 mb-1">
            Excluded Countries
          </label>
          <input
            type="text"
            value={config.excludedCountries}
            onChange={(e) =>
              handleConfigChange("excludedCountries", e.target.value)
            }
            placeholder="e.g., India, Pakistan, Bangladesh"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Fetch Interval */}
        <div>
          <label className="block text-xs text-gray-300 mb-1">
            Fetch Interval (seconds) - Min: 20
          </label>
          <input
            type="text"
            value={config.fetchInterval}
            onChange={(e) =>
              handleNumberInput("fetchInterval", e.target.value, 20)
            }
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            placeholder="20"
          />
        </div>

        {/* Max Job Age */}
        <div>
          <label className="block text-xs text-gray-300 mb-1">
            Jobs Posted Within (minutes) - 0 = All
          </label>
          <input
            type="text"
            value={config.maxJobAge}
            onChange={(e) => handleNumberInput("maxJobAge", e.target.value, 0)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            placeholder="5"
          />
        </div>

        {/* Notification Options */}
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.chromeNotifications}
              onChange={(e) =>
                handleConfigChange("chromeNotifications", e.target.checked)
              }
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <Bell className="w-4 h-4 text-gray-400" />
            <span className="text-xs">Chrome Notifications</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.telegramNotifications}
              onChange={(e) =>
                handleConfigChange("telegramNotifications", e.target.checked)
              }
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <Send className="w-4 h-4 text-gray-400" />
            <span className="text-xs">Telegram Notifications</span>
          </label>
        </div>
      </div>

      {/* Control Button */}
      <div className="space-y-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="text-sm cursor-pointer w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
          >
            <Play className="w-5 h-5" />
            <span>Start Monitoring</span>
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="text-sm cursor-pointer w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
          >
            <Square className="w-5 h-5" />
            <span>Stop Monitoring</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Popup;
