//jshint esversion:6
require('dotenv').config();
const config = require("config");
const express = require("express");
const usersRoute = require("./routes/console.route");
const showsRoute = require("./routes/show.route");
const mixesRoute = require("./routes/mix.route");
const blogsRoute = require("./routes/blog.route");
const apiRoute = require("./routes/api.route");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require("lodash");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const async = require('async');
const cookieParser = require('cookie-parser');
const chalk = require("chalk");
const figlet = require('figlet');
const momentMiddleware = require("./middleware/momentMiddleware");
const mysql = require('mysql');
const util = require('util');
const https = require("https");
const fs = require("fs");
const helmet = require("helmet");
const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.crt")
};

const cors = require('cors');
const multer = require('multer');
// const moment = require("moment");

//   Per i test in locale
//   host = 'localhost';
//   database = 'futuradiodb';
//   user = 'root';
//   password = 'root'

  database = process.env.DATABASE;
  user = process.env.DBUSER;
  password = process.env.DBPSW;

var db = mysql.createConnection({
    database : database,
    user     : user,
    password : password
});

db.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }

    console.log('Connected as id ' + db.threadId);
});

global.db = db;
const query = util.promisify(db.query).bind(db);
global.query = query;

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cookieParser())
app.use(express.json());
app.use(cors());

//use users route for api/users
app.use("/console", usersRoute);
app.use("/shows", showsRoute);
app.use("/blogs", blogsRoute);
app.use("/mixes", mixesRoute);
app.use("/api", apiRoute);
app.use(express.static("public"));
app.use(helmet()); // Add Helmet as a middleware

app.use(helmet.contentSecurityPolicy({
				 directives:{
				   defaultSrc:["'self'", "'unsafe-eval'"],
				   scriptSrc:["'self'","'unsafe-inline'","'unsafe-eval'","https://ajax.googleapis.com/","https://cdn.jsdelivr.net","https://cdnjs.cloudflare.com","https://stackpath.bootstrapcdn.com"],
				   styleSrc:["'self'","https://stackpath.bootstrapcdn.com/","'unsafe-inline'","https://pro.fontawesome.com/","https://cdnjs.cloudflare.com/","https://fonts.googleapis.com/"],
				   fontSrc:["'self'",'https://fonts.googleapis.com/',"https://pro.fontawesome.com/", "https://fonts.gstatic.com/"],
           imgSrc:["'self'", "'unsafe-eval'", "data:","https://upload.wikimedia.org/"]}
}));

mongoose.connect('mongodb+srv://admin-cava:admin123@cluster0-kuomu.mongodb.net/futuradioDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);
const importedUser = require('./models/user.model');
const importedShow = require('./models/show.model');
const importedBlog = require('./models/blog.model');
const importedMix = require('./models/mix.model');
const importedPost = require('./models/post.model');

app.get("/", async function(req, res){

  try{
    let sql = 'SELECT * FROM shows';
    const programList = await query(sql);
    const newProgramList = programList.map(v => Object.assign({}, v));

    console.log(newProgramList);

    var showList = newProgramList.filter(function (el) {
      return el.type === 'podcast';
    });

    var blogList = newProgramList.filter(function (el) {
      return el.type === 'blog';
    });

    var mixList = newProgramList.filter(function (el) {
      return el.type === 'mix';
    });

    console.log('showList è');
    console.log(showList);
    console.log('blogList è');
    console.log(blogList);
    console.log('mixList è');
    console.log(mixList);

    res.render('home-new', {
        shows: showList,
        blogs: blogList,
        mixes: mixList
    });

  }catch(e){
    res.status(500).send(e);
  };

});

app.get("/home", function(req, res){

  var fs = importedShow.Show.find();
  var fb = importedBlog.Blog.find();
  var fm = importedMix.Mix.find();

  var resourcesStack = {
      showList: fs.exec.bind(fs),
      blogList: fb.exec.bind(fb),
      mixList: fm.exec.bind(fm)
  };

  async.parallel(resourcesStack, function (error, resultSet){
    if (error) {
        res.status(500).send(error);
        return;
    }
    console.log("Lista di show")
    console.log(resultSet);
    res.render('home', {
        shows: resultSet.showList,
        blogs: resultSet.blogList,
        mixes: resultSet.mixList
    });
});

});

app.get("/createPage", function(req,res){
  res.render("createPage");
});

app.get("/createUser", function(req,res){
  res.render("createUser");
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const dateString = new Date().toISOString();
  const item = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
    author: req.body.postAuthor,
    date: dateString,
    program: _.camelCase(req.body.postProgram)
  });
  item.save(function(err){
    if(!err){
      res.redirect("/");
    }else{
      console.log("Something went wrong, post not saved");
    }
  });
});

app.get("/about", function(req,res){

  importedUser.User.find(function(err, foundUsers){

    if(err){
      console.log(err);
    }else{
      if(foundUsers){
        console.log(foundUsers);
        res.render("about",{users: foundUsers});
      }else{
        res.render("/");
      }
    }

  });
});


// PORTA SERVER
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

// app.listen(port, function() {
//
// });

https.createServer(options, app).listen(port, function(){
  console.log("Server have started");
  console.log(
  chalk.magenta(figlet.textSync('FutuRadio', { horizontalLayout: 'full' })) +
  chalk.magenta("\nWelcome to FutuRadio website!")
  );
});
