const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  userHead:String,
  username:String,
  content:String,
  userId:String,
  time:String,
  date:String
});

const Tweet = mongoose.model('Tweet',tweetSchema);

module.exports = Tweet;
