const User = require("../models/User");
const { scrapeErpData } = require("../services/erpScraperService");

const mongooseConnectionReady = () => {
  const mongoose = require("mongoose");
  return mongoose.connection.readyState === 1;
};

const getCurrentUser = async (erpId) => {
  if (!mongooseConnectionReady()) {
    return null;
  }

  return User.findOne({ erpId });
};

const syncData = async (req, res) => {
  const erpId = req.user?.erpId;
  const { password } = req.body;

  if (!erpId || !password) {
    return res.status(400).json({ message: "erpId from token and password are required" });
  }

  const data = await scrapeErpData({ erpId, password });

  if (mongooseConnectionReady()) {
    await User.findOneAndUpdate(
      { erpId },
      {
        $set: {
          profile: data.profile,
          attendance: data.attendance,
          timetable: data.timetable,
          notices: data.notices,
          lastSynced: new Date(),
        },
      },
      { new: true }
    );
  }

  return res.json({
    message: "ERP sync completed",
    data,
  });
};

const getAttendance = async (req, res) => {
  const erpId = req.user?.erpId;
  const user = await getCurrentUser(erpId);

  if (!user) {
    return res.json({ attendance: [] });
  }

  return res.json({ attendance: user.attendance || [] });
};

const getTimetable = async (req, res) => {
  const erpId = req.user?.erpId;
  const user = await getCurrentUser(erpId);

  if (!user) {
    return res.json({ timetable: [] });
  }

  return res.json({ timetable: user.timetable || [] });
};

const getNotices = async (req, res) => {
  const erpId = req.user?.erpId;
  const user = await getCurrentUser(erpId);

  if (!user) {
    return res.json({ notices: [] });
  }

  return res.json({ notices: user.notices || [] });
};

const getProfile = async (req, res) => {
  const erpId = req.user?.erpId;
  const user = await getCurrentUser(erpId);

  if (!user) {
    return res.json({
      profile: {
        name: "Demo Student",
        email: `${erpId}@college.edu`,
      },
      lastSynced: null,
    });
  }

  return res.json({
    profile: user.profile,
    lastSynced: user.lastSynced,
  });
};

module.exports = {
  syncData,
  getAttendance,
  getTimetable,
  getNotices,
  getProfile,
};
