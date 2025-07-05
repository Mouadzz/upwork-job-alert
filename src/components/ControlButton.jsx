import { Play, Square } from "lucide-react";

const ControlButton = ({ isRunning, onStart, onStop }) => {
  return (
    <div className="w-3/4 mx-auto space-y-2">
      {!isRunning ? (
        <button
          onClick={onStart}
          className="cursor-pointer w-full flex items-center justify-center space-x-2 py-3 px-3 rounded-lg font-medium bg-green-600 hover:bg-green-700 active:bg-green-800 text-white transition-all duration-200 focus:outline-none shadow-lg hover:shadow-xl active:shadow-md active:scale-95"
        >
          <Play className="w-4 h-4" />
          <span className="text-sm font-semibold">Start Monitoring</span>
        </button>
      ) : (
        <button
          onClick={onStop}
          className="cursor-pointer w-full flex items-center justify-center space-x-2 py-3 px-3 rounded-lg font-medium bg-red-600 hover:bg-red-700 active:bg-red-800 text-white transition-all duration-200 focus:outline-none shadow-lg hover:shadow-xl active:shadow-md active:scale-95"
        >
          <Square className="w-4 h-4" />
          <span className="text-sm font-semibold">Stop Monitoring</span>
        </button>
      )}
    </div>
  );
};

export default ControlButton;
