import BottomNav from "../components/layout/BottomNav";

const Home = () => {
  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Good Morning 👋</h1>
        <p className="text-gray-400 text-sm">Welcome back to your ERP Dashboard</p>
      </div>

      {/* Today’s Classes */}
      <div className="bg-gray-800 p-4 rounded-xl mb-4">
        <h2 className="text-lg font-semibold mb-3">📚 Today's Classes</h2>
        <div className="space-y-2">
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="font-medium">Computer Networks</p>
            <p className="text-sm text-gray-400">10:00 - 11:00</p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg">
            <p className="font-medium">DBMS</p>
            <p className="text-sm text-gray-400">11:00 - 12:00</p>
          </div>
        </div>
      </div>

      {/* Attendance */}
      <div className="bg-gray-800 p-4 rounded-xl mb-4">
        <h2 className="text-lg font-semibold mb-3">✅ Attendance</h2>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div className="bg-green-500 h-3 rounded-full w-[75%]"></div>
        </div>
        <p className="text-sm mt-2 text-gray-400">75%</p>
      </div>

      {/* Notice */}
      <div className="bg-gray-800 p-4 rounded-xl">
        <h2 className="text-lg font-semibold mb-2">📢 Latest Notice</h2>
        <p className="text-gray-400">No new notices</p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;