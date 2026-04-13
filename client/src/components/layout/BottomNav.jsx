import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const { pathname } = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/timetable", label: "Timetable", icon: "📅" },
    { path: "/attendance", label: "Attendance", icon: "✅" },
    { path: "/notices", label: "Notices", icon: "📢" },
    { path: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-gray-900 flex justify-around items-center py-3 border-t border-gray-700">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center gap-1 text-xs transition ${
            pathname === item.path ? "text-blue-400" : "text-gray-400"
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </div>
  );
};

export default BottomNav;