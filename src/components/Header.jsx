const Header = () => {
  return (
    <div className="text-center px-8 py-4 border-b border-gray-800">
      <h1 className="text-2xl font-bold text-blue-400 mb-2">
        Upwork Job Alert
      </h1>
      <p className="text-sm text-gray-400 leading-relaxed">
        Checks for new jobs every interval using your selected feed
      </p>
    </div>
  );
};

export default Header;
