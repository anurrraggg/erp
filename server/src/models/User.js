const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  erpId: {
    type: String,
    required: true,
    unique: true,
  },

  passwordHash: {
    type: String,
    required: true,
  },

  profile: {
    name: {
      type: String,
      default: "Demo Student",
    },
    email: {
      type: String,
      default: "",
    },
  },

  attendance: [
    {
      subject: String,
      percent: Number,
    },
  ],

  timetable: [
    {
      day: String,
      subject: String,
      time: String,
      room: String,
    },
  ],

  notices: [
    {
      title: String,
      content: String,
      date: String,
    },
  ],

  lastSynced: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);