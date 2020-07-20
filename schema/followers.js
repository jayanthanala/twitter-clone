const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  userId:String,
  followers:[{type:String}]
});

const Follower = mongoose.model("Follower",followSchema);

module.exports = Follower;
