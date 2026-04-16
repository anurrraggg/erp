import BottomNav from "../components/layout/BottomNav";
import { useEffect, useState } from "react";
import API from "../services/api";
import useUserStore from "../store/userStore";

const Profile = () => {
  const logout = useUserStore((state) => state.logout);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get("/erp/profile");
        const profile = res.data.profile;
        if (profile) {
          setUser({
            ...user,
            name: profile.name,
            email: profile.email,
          });
        }
      } catch (error) {
        // Keep fallback data from the store.
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleSync = async () => {
    try {
      setSyncLoading(true);
      setSyncMessage("");
      await API.post("/erp/sync", {});
      setSyncMessage("Sync completed successfully!");
    } catch (error) {
      setSyncMessage(error.response?.data?.message || "Sync failed.");
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold mb-4">Profile</h1>

      <div className="bg-gray-800 p-4 rounded-xl mb-4">
        <p className="font-medium">Name: {user?.name || "Student"}</p>
        <p className="text-gray-400 text-sm">ERP ID: {user?.erpId || user?.rollNo || "N/A"}</p>
        <p className="text-gray-400 text-sm">Email: {user?.email || "N/A"}</p>
      </div>

      <button
        onClick={handleSync}
        disabled={syncLoading}
        className="w-full bg-blue-500 py-3 rounded-xl mb-3 font-medium hover:bg-blue-600 transition disabled:bg-blue-300 flex justify-center items-center"
      >
        {syncLoading ? "Syncing..." : "Sync ERP Data"}
      </button>

      {syncMessage && <p className="text-sm text-gray-300 mb-3">{syncMessage}</p>}

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