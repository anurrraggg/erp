const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  erpId: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true, // will be encrypted
  },

  lastSynced: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);