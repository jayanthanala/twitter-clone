const mongoose = require('mongoose');
const passlm = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username:String,
  name:String,
  email:String,
  password:String,
  followers:[{type:String}]
});

userSchema.plugin(passlm)

const User = mongoose.model('User',userSchema);

module.exports = User;
