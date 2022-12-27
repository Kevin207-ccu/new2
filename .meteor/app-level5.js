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
    password:String
})

userSchema.plugin(passportLocalMongoose);

// const secret = "Thisisourlittlesecret"
// **add encryption**
// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields: ['password'] })

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());



passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
  res.render("home");
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


  if (req.isAuthenticated()){

    res.render("secrets");
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

        passport.authenticate('local', {
          successRedirect: '/',
          failureRedirect: '/login',
          failureFlash: true
        })
        
          res.render("secrets");
        
          console.log(req.isAuthenticated())

      }
    })



  });



  app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
