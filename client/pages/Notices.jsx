import BottomNav from "../components/layout/BottomNav";

const notices = [
  {
    title: "Holiday Tomorrow",
    content: "College will remain closed tomorrow.",
    date: "Nov 15, 2024",
  },
  {
    title: "Exam Schedule",
    content: "Mid sem exams start next week.",
    date: "Nov 14, 2024",
  },
];

const Notices = () => {
  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold mb-1">📢 Notices</h1>
      <p className="text-gray-400 text-sm mb-4">Latest announcements</p>

      <div className="space-y-3">
        {notices.map((n, i) => (
          <div key={i} className="bg-gray-800 p-4 rounded-xl">
            <div className="flex justify-between items-start mb-1">
              <p className="font-medium text-base">{n.title}</p>
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                {n.date}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {n.content}
            </p>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notices;