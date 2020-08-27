require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const User = require("./schema/user");
const Tweet = require("./schema/tweets");

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
//mongoose.connect("mongodb+srv://"+process.env.NAME+":"+process.env.PASS+"@twitterclone.2z57d.mongodb.net/twitterDB?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

////////////////////////////////////////////////////////////////////   GETS    //////////////////////////////////////////////////////////////

app.get("/",(req,res) => {
  res.render("login");
});

app.get("/profile",(req,res) => {
  res.render("profile")
});

app.get("/register",(req,res) => {
  res.render("register");
});


app.get("/bitter/:id",authenticated,(req,res) => {
  Tweet.find({userId:req.user.id},(err, foundTweets) => {
    if(err){console.log(err);}
    else{
      res.render("account",{user:req.user,tweets:foundTweets.reverse(),mine:req.user.id});
    }
  });
});

app.get("/:id/feed",authenticated,(req,res) => {
  User.find({_id:req.user.id},(err,foundUser) => {
    if(err){console.log(err);res.redirect('back');}
    else{
      Tweet.find({userId:foundUser[0].following},(err,foundTweets) => {
        if(err){console.log(err);}
        else{
          //console.log(foundTweets);
          res.render("feed",{user:foundUser[0],tweets:foundTweets.reverse(),mine:req.user.id});
        }
      });
    }
  });
});

app.get("/search",authenticated,(req,res) => {
  var searchedName = req.query.username;
  if(req.query.username === req.user.username){
    res.send("Dont search yourself fool.");
  }else{
    User.findOne({username: searchedName},(err,foundUser) => {
      if(err){console.log(err);}
      else{
        Tweet.find({userId:foundUser.id},(err,foundTweet) => {
          if(err){console.log(err);}
          else{
              res.render("user",{user:foundUser,tweets:foundTweet.reverse(),mine:req.user.id})
          }
        });
      }
    });
  }
});

app.get("/tweet/update/:id",authenticated,(req,res) => {
  Tweet.findById(req.params.id,(err,tweet) => {
    if(err){console.log(err);}
    else{
      res.render("update",{tweet:tweet,user:req.user});
    }
  })
})

app.get("/logout",(req,res) => {
  req.logout();
  res.redirect("/")
});

////////////////////////////////////////////////////////////////////   POSTS    //////////////////////////////////////////////////////////////

app.post("/register",(req,res) => {
  var user = {
    username:req.body.username,
    name:req.body.fname,
    email:req.body.email,
    place:req.body.place
  }
  User.register(user,req.body.password,(err,user) => {
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,() => {
        res.redirect(req.user.id+"/feed");
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
        res.redirect(req.user.id+"/feed");
      });
    }
  });
});

app.post("/bitter/:id/newtweet",authenticated,(req,res)=>{
   var d = new Date();

   const tweet = {
     content:req.body.tweet,
     userHead:req.user.name,
     userId:req.user.id,
     username:req.user.username,
     date: d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear(),
     time: d.getHours()+":"+d.getMinutes()
   }
   Tweet.create(tweet,(err,status) => {
     if(err){
       console.log(err);
     }else{
       //res.redirect("/bitter/"+req.user.id);
       res.redirect('back');
     }
   });
});


app.post("/follow",authenticated,(req,res) => {
  var friendId = req.body.button;
  User.updateOne({_id:req.user.id},{$push: {following:friendId}},(err) => {
    if(err){
      console.log(err);
    }else{
      User.updateOne({_id:friendId},{$push: {followers:req.user.id}},(err) =>{
        if(err){console.log(err);}
        else{
          res.redirect('back');
        }
      });
    }
  })
});

app.post("/unfollow",authenticated,(req,res) => {
  var friendId = req.body.button;
  User.updateOne({_id:req.user.id},{$pull: {following:friendId}},(err) => {
    if(err){console.log(err);}
    else{
      User.updateOne({_id:friendId},{$pull: {followers:req.user.id}},(err) => {
        if(err){console.log(err);}
        else{
          res.redirect('back');
        }
      });
    }
  })
});

app.post("/like/:tweetid",authenticated,(req,res) => {
  var tweetId = req.params.tweetid;
  Tweet.updateOne({_id:tweetId},{$push:{likes:req.user.id}},(err) => {
    if(err){console.log(err);}
    else{
      res.redirect('back');
    }
  });
});

app.post("/unlike/:tweetid",authenticated,(req,res) => {
  var tweetId = req.params.tweetid;
  Tweet.updateOne({_id:tweetId},{$pull:{likes:req.user.id}},(err) => {
    if(err){console.log(err);}
    else{
      res.redirect('back');
    }
  });
});



app.post("/delete",authenticated,(req,res) =>{
  Tweet.deleteOne({_id:req.body.button},(err,suc) => {
    if(err){
      console.log(err);
    }else{
      res.redirect("/bitter/"+req.user.id);
    }
  })
});

app.post("/tweet/update/:id",authenticated,(req,res) => {
  Tweet.findOneAndUpdate({_id:req.params.id},{$set:{content:req.body.tweet}},(err) => {
    if(err){console.log(err);}
    else{
      res.redirect("/bitter/"+req.user.id)
    }
  })
});












function authenticated(req,res,next){
  if(req.isAuthenticated()) {
    next();
  }
  else {
    res.redirect('/');
    }
}

app.listen(process.env.PORT || 3000,() => {
  console.log("Server is up at port 3000");
})
