import { useEffect, useState } from "react";
import BottomNav from "../components/layout/BottomNav";
import API from "../services/api";

const Home = () => {
  const [data, setData] = useState({
    profile: null,
    attendance: [],
    timetable: [],
    notices: []
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    try {
      const [profileRes, attRes, ttRes, notRes] = await Promise.all([
        API.get("/erp/profile"),
        API.get("/erp/attendance"),
        API.get("/erp/timetable"),
        API.get("/erp/notices")
      ]);
      setData({
        profile: profileRes.data.profile,
        attendance: attRes.data.attendance,
        timetable: ttRes.data.timetable,
        notices: notRes.data.notices
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await API.post("/erp/sync", {});
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData().then(() => {
      // Trigger background sync implicitly on mount
      handleSync();
    });
  }, []);

  if (loading && !data.profile) {
    return <div className="p-4 h-screen flex justify-center items-center text-white bg-black">Loading Dashboard...</div>;
  }

  // Calculate average attendance safely
  const averageAttendance = data.attendance?.length 
    ? Math.round(data.attendance.reduce((acc, curr) => acc + curr.percent, 0) / data.attendance.length) 
    : 0;

  return (
    <div className="p-4 pb-20 text-white bg-black min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold mb-1">Good Morning 👋</h1>
           <p className="text-gray-400 text-sm">Welcome back, {data.profile?.name}</p>
        </div>
        <button 
           onClick={handleSync} 
           disabled={syncing}
           className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Refresh Data"}
        </button>
      </div>

      {/* Today’s Classes */}
      <div className="bg-gray-800 p-4 rounded-xl mb-4">
        <h2 className="text-lg font-semibold mb-3">📚 Scheduled Classes</h2>
        <div className="space-y-2">
          {data.timetable && data.timetable.length > 0 ? data.timetable.map((t, i) => (
             <div key={i} className="bg-gray-700 p-3 rounded-lg">
               <p className="font-medium">{t.subject} {t.room ? `(${t.room})` : ''}</p>
               <p className="text-sm text-gray-400">{t.time}</p>
             </div>
          )) : (
             <p className="text-gray-400 text-sm">No classes scheduled today.</p>
          )}
        </div>
      </div>

      {/* Attendance */}
      <div className="bg-gray-800 p-4 rounded-xl mb-4">
        <h2 className="text-lg font-semibold mb-3">✅ Avg Attendance</h2>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div className="bg-green-500 h-3 rounded-full" style={{ width: `${averageAttendance}%` }}></div>
        </div>
        <p className="text-sm mt-2 text-gray-400">{averageAttendance}% Overall</p>
      </div>

      {/* Notice */}
      <div className="bg-gray-800 p-4 rounded-xl">
        <h2 className="text-lg font-semibold mb-2">📢 Latest Notice</h2>
        {data.notices && data.notices.length > 0 ? (
           <div className="bg-gray-700 p-3 rounded-lg">
             <p className="font-medium text-sm text-gray-200">{data.notices[0].title}</p>
             <p className="text-xs text-gray-400 mt-1">{data.notices[0].date}</p>
           </div>
        ) : (
           <p className="text-gray-400 text-sm">No new notices</p>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;