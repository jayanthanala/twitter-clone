const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  userHead:String,
  content:[{
    text:String,
    likes:Number
  }],
  userId:String
});

const Tweets = mongoose.model('Tweets',tweetSchema);

module.exports = Tweets;
