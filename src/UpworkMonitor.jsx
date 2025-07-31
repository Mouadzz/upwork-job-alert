import { useState, useEffect } from "react";
import Header from "./components/Header";
import ConfigContainer from "./components/ConfigContainer";
import ControlButton from "./components/ControlButton";
import ErrorDisplay from "./components/ErrorDisplay";

const UpworkMonitor = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({
    endpoint: "myFeed",
    requirePaymentVerification: false,
    minClientSpending: 0,
    excludedCountries: "India, Pakistan, Bangladesh",
    fetchInterval: 20,
    chromeNotifications: true,
    telegramNotifications: true,
    maxJobAge: 5,
  });

  useEffect(() => {
    checkRunningStatus();

    const messageListener = (message, sender, sendResponse) => {
      if (message.action === "statusChanged") {
        setIsRunning(message.isRunning);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
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

      if (authCookies.length === 0) return null;

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
    if (!config.fetchInterval || config.fetchInterval < 20) {
      setError(
        "Fetch interval must be at least 20 seconds to avoid spamming Upwork's servers."
      );
      return false;
    }
    if (config.maxJobAge < 0) {
      setError("Job age filter cannot be negative.");
      return false;
    }
    if (config.minClientSpending < 0) {
      setError("Min client spending cannot be negative.");
      return false;
    }
    return true;
  };

  const handleStart = async () => {
    setError(null);

    if (!validateConfig()) return;

    const tokenInfo = await getTokenInfo();
    if (!tokenInfo) {
      setError("You are not logged in. Please log in to Upwork and try again.");
      return;
    }

    if (new Date() >= new Date(tokenInfo.expiry)) {
      setError(
        "Your login session has expired. Please log in to Upwork again."
      );
      return;
    }

    try {
      // Log the config to see if endpoint is being passed correctly
      console.log("Starting with config:", config);

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
    console.log(`Config changed: ${key} = ${value}`); // Debug log
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <ErrorDisplay error={error} onClose={() => setError(null)} />

      <div className="max-w-xl mx-auto px-8 py-10">
        <Header />

        <div className="mt-8">
          <ConfigContainer
            config={config}
            onConfigChange={handleConfigChange}
          />
        </div>

        <div className="mt-8 flex justify-center">
          <ControlButton
            isRunning={isRunning}
            onStart={handleStart}
            onStop={handleStop}
          />
        </div>
      </div>
    </div>
  );
};

export default UpworkMonitor;
