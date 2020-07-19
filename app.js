require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const User = require("./schema/user");
const Tweet = require("./schema/tweet");

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/bitDB",{useNewUrlParser:true,useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);


passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req,res) => {
  res.render("landing");
});

app.get("/register",(req,res) => {
  res.render("register");
});

app.get("/login",(req,res) => {
  res.render("login");
});

app.get("/bitter/:id",authenticated,(req,res) => {
  User.findOne({_id:req.user._id},(err, foundUser) => {
    if(err){console.log(err);}
    else{
      Tweet.find({userId:req.user._id},(err,foundTweet) => {
        if(err){console.log(err);}
        else{
          if(foundTweet){
            //console.log(foundTweet);
            res.render("userindex",{user:foundUser,tweet:foundTweet.reverse()});
          }
        }
      });
    }
  });
});














app.post("/register",(req,res) => {
  var user = {
    username:req.body.username,
    name:req.body.fname,
    email:req.body.email
  }
  User.register(user,req.body.password,(err,user) => {
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,() => {
        var tweetId = {
          userId:req.user.id
        };
        Tweet.create(tweetId,(err,status) => {
          if(err){
            console.log(err);
          }else{
            res.redirect("/bitter/"+req.user.id);
          }
        });
      });
    }
  });
});

app.post("/login",(req,res)=>{
  var user = new User({
    username:req.body.username,
    password:req.body.password,
  });
  req.login(user,(err,sol)=>{
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local")(req,res,() => {
        res.redirect("/bitter/"+req.user._id);
      });
    }
  });
});

// app.post("/bitter/:id/tweets",authenticated,(req,res)=>{
//    var tweet = {
//      content:req.body.tweet,
//      userId:req.user._id
//    }
//    Tweet.create(tweet,(err,result) => {
//       if(err){console.log(err);}
//       else{console.log(result);res.redirect("/bitter/"+req.user._id);}
//   });
// });

app.post("/bitter/:id/tweets",authenticated,(req,res)=>{
   const tweet = req.body.tweet;

   Tweet.updateOne({userId:req.user.id},{$push: {content:tweet}},(err) => {
     if(err){
       console.log(err);
     }else{
      console.log("done");
     }
   });
});












function authenticated(req,res,next){
  if(req.isAuthenticated()) {
    next();
  }
  else {
    //console.log("not authenticated");
    res.redirect('login');
    }
}

app.listen(3000,() => {
  console.log("Server is up at port 3000");
})
