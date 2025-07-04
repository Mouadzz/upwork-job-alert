function ConfigSection({ config, onConfigChange }) {
  const handleChange = (field, value) => {
    onConfigChange(field, value);
  };

  return (
    <div className="bg-gray-800 p-2 border-b border-gray-600">
      {/* Job Filters Row */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Max Minutes Old
          </label>
          <input
            type="number"
            value={config.MAX_MINUTES_OLD}
            onChange={(e) =>
              handleChange("MAX_MINUTES_OLD", parseInt(e.target.value) || 0)
            }
            className="w-full p-1 text-xs border border-gray-600 rounded bg-gray-700 text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Min Client Spending ($)
          </label>
          <input
            type="number"
            value={config.MIN_CLIENT_SPENDING}
            onChange={(e) =>
              handleChange("MIN_CLIENT_SPENDING", parseInt(e.target.value) || 0)
            }
            className="w-full p-1 text-xs border border-gray-600 rounded bg-gray-700 text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            min="0"
          />
        </div>
      </div>

      {/* Timing Settings Row */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Switch Interval (seconds)
          </label>
          <input
            type="number"
            value={config.SWITCH_INTERVAL / 1000}
            onChange={(e) =>
              handleChange(
                "SWITCH_INTERVAL",
                (parseInt(e.target.value) || 1) * 1000
              )
            }
            className="w-full p-1 text-xs border border-gray-600 rounded bg-gray-700 text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            step="1"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Wait After Switch (seconds)
          </label>
          <input
            type="number"
            value={config.WAIT_AFTER_SWITCH / 1000}
            onChange={(e) =>
              handleChange(
                "WAIT_AFTER_SWITCH",
                (parseInt(e.target.value) || 1) * 1000
              )
            }
            className="w-full p-1 text-xs border border-gray-600 rounded bg-gray-700 text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            step="1"
          />
        </div>
      </div>

      {/* Additional Options Row */}
      <div className="grid grid-cols-2 gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Excluded Countries
          </label>
          <input
            type="text"
            value={config.EXCLUDED_COUNTRIES}
            onChange={(e) => handleChange("EXCLUDED_COUNTRIES", e.target.value)}
            placeholder="India, Pakistan, Bangladesh"
            className="w-full p-1 text-xs border border-gray-600 rounded bg-gray-700 text-gray-100 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="payment-verification"
            checked={config.REQUIRE_PAYMENT_VERIFICATION}
            onChange={(e) =>
              handleChange("REQUIRE_PAYMENT_VERIFICATION", e.target.checked)
            }
            className="w-3 h-3 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="payment-verification"
            className="text-xs font-medium text-gray-300"
          >
            Payment verified ?
          </label>
        </div>
      </div>
    </div>
  );
}

export default ConfigSection;
