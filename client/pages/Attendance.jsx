import BottomNav from "../components/layout/BottomNav";

const subjects = [
  { name: "CN", percent: 80 },
  { name: "DBMS", percent: 72 },
  { name: "OS", percent: 60 },
];

const getColor = (p) => {
  if (p >= 75) return "bg-green-500";
  if (p >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

const Attendance = () => {
  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold mb-1">✅ Attendance</h1>
      <p className="text-gray-400 text-sm mb-4">Your attendance summary</p>

      <div className="space-y-4">
        {subjects.map((sub, i) => (
          <div key={i} className="bg-gray-800 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium">{sub.name}</p>
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