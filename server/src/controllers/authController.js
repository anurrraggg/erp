const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  const { erpId, password } = req.body;

  if (!erpId || !password) {
    return res.status(400).json({ message: "erpId and password are required" });
  }

  let user = null;

  if (mongooseConnectionReady()) {
    user = await User.findOne({ erpId });

    if (user) {
      if (!user.passwordHash) {
        user.passwordHash = await bcrypt.hash(password, 10);
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid ERP credentials" });
      }

      await user.save();
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      user = new User({
        erpId,
        passwordHash,
        profile: {
          name: "Demo Student",
          email: `${erpId}@college.edu`,
        },
      });
      await user.save();
    }
  }

  const token = jwt.sign(
    { id: user?._id?.toString() || erpId, erpId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({
    token,
    user: {
      id: user?._id?.toString() || erpId,
      erpId,
      name: user?.profile?.name || "Demo Student",
      email: user?.profile?.email || `${erpId}@college.edu`,
    },
  });
};

const mongooseConnectionReady = () => {
  const mongoose = require("mongoose");
  return mongoose.connection.readyState === 1;
};

module.exports = { login };