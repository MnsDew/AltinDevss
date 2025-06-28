const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  avatar: {
    type: String,
    default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
  },    
});

module.exports = User = mongoose.model("user", UserSchema);