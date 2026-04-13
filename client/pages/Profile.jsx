import BottomNav from "../components/layout/BottomNav";
import useUserStore from "../store/userStore";

const Profile = () => {
  const logout = useUserStore((state) => state.logout);
  const user = useUserStore((state) => state.user);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold mb-4">Profile</h1>

      <div className="bg-gray-800 p-4 rounded-xl mb-4">
        <p className="font-medium">Name: {user?.name || "Student"}</p>
        <p className="text-gray-400 text-sm">Roll No: {user?.rollNo || "N/A"}</p>
        <p className="text-gray-400 text-sm">Email: {user?.email || "N/A"}</p>
      </div>

      <button className="w-full bg-blue-500 py-3 rounded-xl mb-3 font-medium hover:bg-blue-600 transition">
        Refresh Data
      </button>

      <button
        onClick={handleLogout}
        className="w-full bg-red-500 py-3 rounded-xl font-medium hover:bg-red-600 transition"
      >
        Logout
      </button>

      <BottomNav />
    </div>
  );
};

export default Profile;