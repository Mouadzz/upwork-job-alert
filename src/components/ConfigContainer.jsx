import { Bell, Send, ChevronDown } from "lucide-react";

const ConfigContainer = ({ config, onConfigChange }) => {
  const handleNumberInput = (key, value, min = 0) => {
    // Remove any non-numeric characters
    const cleanValue = value.replace(/[^0-9]/g, "");

    // If empty, don't change anything (let user type)
    if (cleanValue === "") {
      onConfigChange(key, "");
      return;
    }

    const numValue = parseInt(cleanValue);

    if (key === "fetchInterval") {
      // Allow any number to be typed, but validate on start
      onConfigChange(key, numValue);
    } else if (numValue < min) {
      onConfigChange(key, min);
    } else {
      onConfigChange(key, numValue);
    }
  };

  const endpoints = [
    { value: "myFeed", label: "My Feed" },
    { value: "bestMatch", label: "Best Match" },
    { value: "mostRecent", label: "Most Recent" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm text-gray-300">Job Feed</label>
        <div className="relative">
          <select
            value={config.endpoint || "myFeed"}
            onChange={(e) => onConfigChange("endpoint", e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            {endpoints.map((endpoint) => (
              <option key={endpoint.value} value={endpoint.value}>
                {endpoint.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.requirePaymentVerification}
            onChange={(e) =>
              onConfigChange("requirePaymentVerification", e.target.checked)
            }
            className="w-5 h-5 accent-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm">Require Payment Verification</span>
        </label>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm text-gray-300">
            Min Client Spending ($)
          </label>
          <input
            type="text"
            value={config.minClientSpending}
            onChange={(e) =>
              handleNumberInput("minClientSpending", e.target.value, 0)
            }
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-gray-300">
            Excluded Countries
          </label>
          <input
            type="text"
            value={config.excludedCountries}
            onChange={(e) =>
              onConfigChange("excludedCountries", e.target.value)
            }
            placeholder="e.g., India, Pakistan, Bangladesh"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-gray-300">
            Fetch Interval (seconds)
            <span className="text-sm text-gray-500 ml-2">Min: 20</span>
          </label>
          <input
            type="text"
            value={config.fetchInterval}
            onChange={(e) =>
              handleNumberInput("fetchInterval", e.target.value, 20)
            }
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="20"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-gray-300">
            Jobs Posted Within (minutes)
            <span className="text-sm text-gray-500 ml-2">0 = All</span>
          </label>
          <input
            type="text"
            value={config.maxJobAge}
            onChange={(e) => handleNumberInput("maxJobAge", e.target.value, 0)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="5"
          />
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.chromeNotifications}
            onChange={(e) =>
              onConfigChange("chromeNotifications", e.target.checked)
            }
            className="w-5 h-5 accent-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="text-sm">Chrome Notifications</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={config.telegramNotifications}
            onChange={(e) =>
              onConfigChange("telegramNotifications", e.target.checked)
            }
            className="w-5 h-5 accent-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <Send className="w-5 h-5 text-gray-400" />
          <span className="text-sm">Telegram Notifications</span>
        </label>
      </div>
    </div>
  );
};

export default ConfigContainer;
