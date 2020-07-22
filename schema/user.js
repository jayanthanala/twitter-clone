const mongoose = require('mongoose');
const passlm = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username:String,
  name:String,
  email:String,
  password:String,
  place:String,
  followers:[{type:String}],
  following:[{type:String}]
});

userSchema.plugin(passlm)

const User = mongoose.model('User',userSchema);

module.exports = User;
