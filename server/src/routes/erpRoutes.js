const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  syncData,
  getAttendance,
  getTimetable,
  getNotices,
  getProfile,
} = require("../controllers/erpController");

const router = express.Router();

router.use(authMiddleware);

router.post("/sync", syncData);
router.get("/profile", getProfile);
router.get("/attendance", getAttendance);
router.get("/timetable", getTimetable);
router.get("/notices", getNotices);

module.exports = router;
