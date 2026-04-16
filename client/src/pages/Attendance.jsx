import BottomNav from "../components/layout/BottomNav";
import { useEffect, useState } from "react";
import API from "../services/api";

const getColor = (p) => {
  if (p >= 75) return "bg-green-500";
  if (p >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

const Attendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const res = await API.get("/erp/attendance");
        setSubjects(res.data.attendance || []);
      } catch (error) {
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold mb-1">✅ Attendance</h1>
      <p className="text-gray-400 text-sm mb-4">Your attendance summary</p>

      {loading && <p className="text-gray-400 text-sm">Loading attendance...</p>}

      {!loading && subjects.length === 0 && (
        <p className="text-gray-400 text-sm">No attendance data yet. Sync from Profile page.</p>
      )}

      <div className="space-y-4">
        {subjects.map((sub, i) => (
          <div key={i} className="bg-gray-800 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium">{sub.subject}</p>
              <p className="text-sm font-semibold">{sub.percent}%</p>
            </div>

            <div className="w-full bg-gray-700 h-3 rounded-full">
              <div
                className={`${getColor(sub.percent)} h-3 rounded-full`}
                style={{ width: `${sub.percent}%` }}
              ></div>
            </div>

          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Attendance;