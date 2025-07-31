import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

const ErrorDisplay = ({ error, type = "error", onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      setIsAnimating(true);

      // Auto-hide after 2 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!error || !isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-900/90 border-green-700 text-green-100";
      case "info":
        return "bg-blue-900/90 border-blue-700 text-blue-100";
      default:
        return "bg-red-900/90 border-red-700 text-red-100";
    }
  };

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-50 transform transition-all duration-300 ease-out ${
        isAnimating
          ? "translate-y-0 opacity-100 scale-100"
          : "-translate-y-full opacity-0 scale-95"
      }`}
    >
      <div
        className={`rounded-lg border backdrop-blur-sm shadow-lg ${getStyles()}`}
      >
        <div className="flex items-start space-x-3 p-4">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {error}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-white/10 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
