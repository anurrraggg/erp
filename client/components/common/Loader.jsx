const Loader = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-center">
        <div className="inline-flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 mt-4">Loading...</p>
      </div>
    </div>
  );
};

export default Loader;
