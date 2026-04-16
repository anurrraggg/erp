import { useEffect, useState, useMemo } from "react";
import API from "../services/api";
import useUserStore from "../store/userStore";

const getColor = (p) => {
  if (p >= 75) return "bg-green-500";
  if (p >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Home = () => {
  const logout = useUserStore((state) => state.logout);
  const [data, setData] = useState({
    profile: null,
    attendance: [],
    timetable: [],
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // Initialize to current day, fallback to Monday if Sunday
  const [selectedDay, setSelectedDay] = useState(() => {
    let day = new Date().toLocaleDateString("en-US", { weekday: "short" });
    return daysOfWeek.includes(day) ? day : "Mon";
  });

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
      handleSync();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todaysClasses = useMemo(() => {
    const currentDayStr = new Date().toLocaleDateString("en-US", { weekday: "short" });
    return data.timetable.filter((item) => item.day === currentDayStr);
  }, [data.timetable]);

  const selectedClasses = useMemo(() => {
    return data.timetable.filter((item) => item.day === selectedDay);
  }, [data.timetable, selectedDay]);

  if (loading && !data.profile) {
    return <div className="p-4 h-screen flex justify-center items-center text-white bg-black">Loading Dashboard...</div>;
  }

  const averageAttendance = data.attendance?.length 
    ? Math.round(data.attendance.reduce((acc, curr) => acc + curr.percent, 0) / data.attendance.length) 
    : 0;

  return (
    <div className="p-4 bg-black text-white min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
           <h1 className="text-2xl font-bold mb-1">Good Morning 👋</h1>
           <p className="text-gray-400 text-sm">Welcome back, {data.profile?.name || "Student"}</p>
        </div>
        <div className="flex flex-col gap-2">
          <button 
             onClick={handleSync} 
             disabled={syncing}
             className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50 transition"
          >
            {syncing ? "Syncing..." : "Refresh Data"}
          </button>
          <button 
             onClick={handleLogout}
             className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Today’s Snapshot */}
      <div className="bg-gray-800 p-4 rounded-xl mb-6 border border-gray-700 shadow-lg">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">📅 Today's Upcoming</h2>
        <div className="space-y-2">
          {todaysClasses.length > 0 ? todaysClasses.map((t, i) => (
             <div key={i} className="bg-gray-700 p-3 rounded-lg border-l-4 border-blue-500">
               <p className="font-medium text-sm">{t.subject} {t.room ? `(${t.room})` : ''}</p>
               <p className="text-xs text-gray-400 mt-1">{t.time}</p>
             </div>
          )) : (
             <p className="text-gray-400 text-sm italic">Nothing scheduled for today! Enjoy your day!</p>
          )}
        </div>
      </div>

      {/* Weekly Timetable Explorer */}
      <div className="bg-gray-800 p-4 rounded-xl mb-6 border border-gray-700 shadow-lg">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">📆 Full Week Timetable</h2>
        
        {/* Day Selector */}
        <div className="flex justify-between items-center bg-gray-900 rounded-lg p-1 mb-4">
          {daysOfWeek.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`flex-1 py-2 text-xs font-medium rounded-md transition ${
                selectedDay === d ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {d.charAt(0)}
            </button>
          ))}
        </div>

        {/* Classes for Selected Day */}
        <div className="space-y-3">
          {selectedClasses.length > 0 ? selectedClasses.map((t, i) => (
             <div key={i} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center shadow-sm">
               <div>
                  <p className="font-medium text-sm text-gray-100">{t.subject}</p>
                  {t.room && <p className="text-xs text-gray-400 mt-1">Room: {t.room}</p>}
               </div>
               <span className="text-xs bg-gray-900 px-2 py-1 rounded text-gray-300 whitespace-nowrap ml-2">
                  {t.time}
               </span>
             </div>
          )) : (
             <p className="text-gray-400 text-sm text-center py-4">No classes scheduled.</p>
          )}
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="bg-gray-800 p-4 rounded-xl mb-6 border border-gray-700 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">✅ Course Attendance</h2>
        
        <div className="mb-5 bg-gray-900 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-1">
             <span className="text-sm font-medium text-gray-300">Overall Average</span>
             <span className="text-sm font-bold text-white">{averageAttendance}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mt-2">
            <div className={`h-3 rounded-full ${getColor(averageAttendance)} transition-all duration-1000`} style={{ width: `${averageAttendance}%` }}></div>
          </div>
        </div>

        {data.attendance && data.attendance.length > 0 && (
          <div className="space-y-4">
            {data.attendance.map((sub, i) => (
              <div key={i}>
                <div className="flex justify-between items-end mb-1">
                  <p className="font-medium text-xs text-gray-300 pr-2 leading-tight">{sub.subject}</p>
                  <p className={`text-xs font-bold whitespace-nowrap ${sub.percent >= 75 ? 'text-green-400' : 'text-red-400'}`}>
                    {sub.percent}%
                  </p>
                </div>
                <div className="w-full bg-gray-700 h-1.5 rounded-full">
                  <div className={`${getColor(sub.percent)} h-1.5 rounded-full`} style={{ width: `${sub.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;