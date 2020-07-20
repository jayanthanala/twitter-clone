const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  userHead:String,
  content:[{type:String}],
  userId:String
});

const Tweet = mongoose.model('Tweet',tweetSchema);

module.exports = Tweet;
