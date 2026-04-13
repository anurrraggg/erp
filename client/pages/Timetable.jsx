import BottomNav from "../components/layout/BottomNav";
import { useState } from "react";

const Timetable = () => {
  const [selectedDay, setSelectedDay] = useState("Mon");
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

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
        <div className="bg-gray-800 p-4 rounded-xl">
          <p className="font-medium">Operating Systems</p>
          <p className="text-sm text-gray-400">9:00 - 10:00</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl border-l-4 border-blue-500">
          <p className="font-medium">Computer Networks</p>
          <p className="text-sm text-gray-400">10:00 - 11:00</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Timetable;