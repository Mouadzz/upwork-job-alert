import { useState, useEffect } from "react";
import { Settings, FileText } from "lucide-react";
import Header from "./components/Header";
import TabNavigation from "./components/TabNavigation";
import ConfigurationTab from "./components/ConfigurationTab";
import CoverLetterTab from "./components/CoverLetterTab";
import ControlButton from "./components/ControlButton";
import ErrorDisplay from "./components/ErrorDisplay";

const Popup = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("configuration");
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
        "Fetch interval must be at least 20 seconds to avoid spamming Upwork's servers. We recommend 30 seconds or more for better reliability."
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

  const handleCloseError = () => {
    setError(null);
  };

  const tabs = [
    {
      id: "configuration",
      label: "Configuration",
      icon: Settings,
    },
    {
      id: "coverLetter",
      label: "Cover Letter",
      icon: FileText,
    },
  ];

  return (
    <div className="w-[420px] h-[600px] bg-gray-900 text-white font-sans flex flex-col relative">
      {/* Toast Notification */}
      <ErrorDisplay error={error} onClose={handleCloseError} />

      {/* Header */}
      <Header />

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {activeTab === "configuration" && (
          <ConfigurationTab
            config={config}
            onConfigChange={handleConfigChange}
          />
        )}
        {activeTab === "coverLetter" && <CoverLetterTab />}
      </div>

      {/* Control Button - reduced padding */}
      <div className="p-4 border-t border-gray-800">
        <ControlButton
          isRunning={isRunning}
          onStart={handleStart}
          onStop={handleStop}
        />
      </div>
    </div>
  );
};

export default Popup;
