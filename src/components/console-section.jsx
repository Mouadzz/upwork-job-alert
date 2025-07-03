import { useEffect, useRef } from "react";

function ConsoleSection({ logs, onClearLogs }) {
  const consoleRef = useRef(null);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex-1 bg-gray-900 text-white flex flex-col min-h-0">
      <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-600">
        <h3 className="text-xs font-medium text-gray-200">Console</h3>
        <button
          onClick={onClearLogs}
          className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded transition-colors"
        >
          Clear
        </button>
      </div>

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
  );
}

export default ConsoleSection;
