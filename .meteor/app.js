//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const encrypt=require("mongoose-encryption")
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require("passport-local-mongoose")
const LocalStrategy = require('passport-local').Strategy
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var findOrCreate = require('mongoose-findorcreate')



//
// const initializePassport =require("./passport-config")
// initializePassport(passport)
//

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  // cookie: { secure: true }
}))

app.use(passport.initialize());
app.use(passport.session());

// mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.connect("mongodb://127.0.0.1:27017/userDB?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.1")

const userSchema= new mongoose.Schema ({
    email:String,
    password:String,
    googleId: String,
    secret: String
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// const secret = "Thisisourlittlesecret"
// **add encryption**
// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields: ['password'] })

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());



passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// passport.serializeUser(function(user, cb) {
//   process.nextTick(function() {
//     return cb(null, user.id);
//   });
// });

// passport.deserializeUser(function(id, cb) {
//   db.get('SELECT * FROM users WHERE id = ?', [ id ], function(err, user) {
//     if (err) { return cb(err); }
//     return cb(null, user);
//   });
// });

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileUrl:"http://www.gooleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  console.log(porfile)
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));


app.get("/", function(req, res){
  res.render("home");
  });

app.get("/auth/google", function(req, res){
  passport.authenticate('google', { scope: ['profile'] })
    
  });

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
  res.redirect('/secrets');
  });

app.get("/login", function(req, res){
  res.render("login");
  });
app.get("/register", function(req, res){
  res.render("register");
  });
app.get("/secrets", function(req, res){
  console.log(req.isAuthenticated())
  // passport.authenticate('local', {
  //   successRedirect: '/',
  //   failureRedirect: '/login',
  //   failureFlash: true
  // })
  User.find({"secret":{$ne:null}},function(err,foundUsers){
     if(err){
      console.log(err)
     }else{
      if(foundUsers){
        res.render("secrets",{usersWithSecrets:foundUsers})
      }
     }
  })
  // if (req.isAuthenticated()){
  //   res.render("secrets");
  // }else{
  //   res.redirect("/login");
  // }
    });
  app.get("/submit", function(req, res){
    console.log(req.isAuthenticated())
     if (req.isAuthenticated()){
        res.render("submit");
      }else{
        res.redirect("/login");
      }
        });
    

    

  app.post("/register", function(req, res){

    User.register({username:req.body.username}, req.body.password, function(err, user) {
  if (err) { 
    console.log(err)
    res.redirect("/register")
  }else{
    passport.authenticate('local')(req, res ,function(){
      res.redirect("/secrets")
    }) 
   

      // Value 'result' is set to false. The user could not be authenticated since the user is not active
    };
  console.log(req.isAuthenticated())


});




  });


  app.post("/login", function(req, res){
    const user= new User({
     username:req.body.username,
     password:req.body.password
   })
    req.login(user,function(err){
      if(err){
        console.log(err)
      }else{

        passport.authenticate('local')(req, res ,function(){
          res.redirect("/secrets")
        }) 
        
          
        
          console.log(req.isAuthenticated())

      }
    })
  });

  app.post("/submit", function(req, res){
    const submittedSecret=req.body.secret
    console.log(req.user.id);
    User.findById(req.user.id,function(err,foundUser){
      if(err){
        console.log(err)
      }else{
        if(foundUser){
          foundUser.secret=submittedSecret;
          foundUser.save(function(){
            res.redirect("/secrets")
          })
        }
      }
    })
  })




  app.listen(3000, function() {
    console.log("Server started on port 3000");
  });


  