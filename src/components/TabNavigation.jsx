const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-gray-800 bg-gray-800/30">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-3 text-xs font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-blue-600 text-white border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
