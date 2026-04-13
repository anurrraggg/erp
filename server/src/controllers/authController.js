const User = require("../models/User");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { erpId, password } = req.body;

  if (!erpId || !password) {
    return res.status(400).json({ message: "erpId and password are required" });
  }

  let user = null;

  if (mongooseConnectionReady()) {
    user = await User.findOne({ erpId });

    if (!user) {
      user = new User({ erpId, password });
      await user.save();
    }
  }

  const token = jwt.sign(
    { id: user?._id || erpId, erpId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    token,
    user: {
      id: user?._id || erpId,
      erpId,
      name: user?.name || "Demo Student",
      email: `${erpId}@college.edu`,
    },
  });
};

const mongooseConnectionReady = () => {
  const mongoose = require("mongoose");
  return mongoose.connection.readyState === 1;
};

module.exports = { login };