import BottomNav from "../components/layout/BottomNav";
import { useEffect, useState } from "react";
import API from "../services/api";

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const res = await API.get("/api/erp/notices");
        setNotices(res.data.notices || []);
      } catch (error) {
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotices();
  }, []);

  return (
    <div className="p-4 pb-20">
      <h1 className="text-xl font-bold mb-1">📢 Notices</h1>
      <p className="text-gray-400 text-sm mb-4">Latest announcements</p>

      <div className="space-y-3">
        {loading && <p className="text-gray-400 text-sm">Loading notices...</p>}

        {!loading && notices.length === 0 && (
          <p className="text-gray-400 text-sm">No notices yet. Sync from Profile page.</p>
        )}

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