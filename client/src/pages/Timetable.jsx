import BottomNav from "../components/layout/BottomNav";
import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

const Timetable = () => {
  const [selectedDay, setSelectedDay] = useState("Mon");
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTimetable = async () => {
      try {
        const res = await API.get("/erp/timetable");
        setTimetable(res.data.timetable || []);
      } catch {
        setTimetable([]);
      } finally {
        setLoading(false);
      }
    };

    loadTimetable();
  }, []);

  const filteredClasses = useMemo(
    () => timetable.filter((item) => item.day === selectedDay),
    [selectedDay, timetable]
  );

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold mb-1">📅 Timetable</h1>
      <p className="text-gray-400 text-sm mb-4">Your class schedule</p>

      {/* Days Scroll */}
      <div className="flex gap-2 overflow-x-auto mb-4">
        {days.map((day) => (
          <div
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-full text-sm cursor-pointer transition ${
              selectedDay === day
                ? "bg-blue-500 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Classes */}
      <div className="space-y-3">
        {loading && <p className="text-gray-400 text-sm">Loading timetable...</p>}

        {!loading && filteredClasses.length === 0 && (
          <p className="text-gray-400 text-sm">No classes available for {selectedDay}.</p>
        )}

        {filteredClasses.map((entry, index) => (
          <div
            key={`${entry.subject}-${entry.time}-${index}`}
            className="bg-gray-800 p-4 rounded-xl border-l-4 border-blue-500"
          >
            <p className="font-medium">{entry.subject}</p>
            <p className="text-sm text-gray-400">{entry.time}</p>
            {entry.room && <p className="text-xs text-gray-500 mt-1">Room: {entry.room}</p>}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Timetable;