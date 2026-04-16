import { useEffect, useState, useMemo } from "react";
import BottomNav from "../components/layout/BottomNav";
import API from "../services/api";
import useUserStore from "../store/userStore";

const getColor = (p) => {
  if (p >= 75) return "bg-green-500";
  if (p >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

const Home = () => {
  const logout = useUserStore((state) => state.logout);
  const [data, setData] = useState({
    profile: null,
    attendance: [],
    timetable: [],
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchData = async () => {
    try {
      const [profileRes, attRes, ttRes] = await Promise.all([
        API.get("/erp/profile"),
        API.get("/erp/attendance"),
        API.get("/erp/timetable"),
      ]);
      setData({
        profile: profileRes.data.profile,
        attendance: attRes.data.attendance,
        timetable: ttRes.data.timetable,
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

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchData().then(() => {
      // Trigger background sync implicitly on mount
      handleSync();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter timetable for TODAY
  const todaysClasses = useMemo(() => {
    const currentDayStr = new Date().toLocaleDateString("en-US", { weekday: "short" }); // e.g. "Mon"
    return data.timetable.filter((item) => item.day === currentDayStr);
  }, [data.timetable]);

  if (loading && !data.profile) {
    return <div className="p-4 h-screen flex justify-center items-center text-white bg-black">Loading Dashboard...</div>;
  }

  // Calculate average attendance safely
  const averageAttendance = data.attendance?.length 
    ? Math.round(data.attendance.reduce((acc, curr) => acc + curr.percent, 0) / data.attendance.length) 
    : 0;

  return (
    <div className="p-4 pb-24 text-white bg-black min-h-screen">
      {/* Header Area */}
      <div className="mb-6 flex justify-between items-start">
        <div>
           <h1 className="text-2xl font-bold mb-1">Good Morning 👋</h1>
           <p className="text-gray-400 text-sm">Welcome back, {data.profile?.name || "Student"}</p>
        </div>
        <div className="flex flex-col gap-2">
          <button 
             onClick={handleSync} 
             disabled={syncing}
             className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Refresh Data"}
          </button>
          <button 
             onClick={handleLogout}
             className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Today’s Classes */}
      <div className="bg-gray-800 p-4 rounded-xl mb-4 border border-gray-700">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">📅 Today's Classes</h2>
        <div className="space-y-2">
          {todaysClasses.length > 0 ? todaysClasses.map((t, i) => (
             <div key={i} className="bg-gray-700 p-3 rounded-lg border-l-4 border-blue-500">
               <p className="font-medium text-sm">{t.subject} {t.room ? `(${t.room})` : ''}</p>
               <p className="text-xs text-gray-400 mt-1">{t.time}</p>
             </div>
          )) : (
             <p className="text-gray-400 text-sm italic">Nothing scheduled for today! Enjoy your day freely!</p>
          )}
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="bg-gray-800 p-4 rounded-xl mb-4 border border-gray-700">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">✅ Attendance</h2>
        
        {/* Overall ProgressBar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
             <span className="text-sm font-medium text-gray-300">Overall Average</span>
             <span className="text-sm font-bold text-white">{averageAttendance}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div className={`h-3 rounded-full ${getColor(averageAttendance)}`} style={{ width: `${averageAttendance}%` }}></div>
          </div>
        </div>

        {/* Individual Subjects */}
        {data.attendance && data.attendance.length > 0 && (
          <div className="space-y-3 mt-4 pt-4 border-t border-gray-700">
            {data.attendance.map((sub, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <p className="font-medium text-sm text-gray-300 truncate pr-2">{sub.subject}</p>
                  <p className="text-xs font-bold text-gray-100 whitespace-nowrap">{sub.percent}%</p>
                </div>
                <div className="w-full bg-gray-700 h-2 rounded-full">
                  <div className={`${getColor(sub.percent)} h-2 rounded-full`} style={{ width: `${sub.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;