//jshint esversion:6
require('dotenv').config();
const config = require("config");
const express = require("express");
const app = express();
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
const dbModule = require('./db/dbModule');

//
// const dbConfig = config.get('dbConfig');
// console.log(dbConfig);
//
// if (process.env.NODE_ENV==="localdev"){
//   password = "root";
// }else{
//   password = process.env.DBPSW;
// }

// var db = mysql.createConnection({
//     database : dbConfig.database,
//     user     : dbConfig.user,
//     password : password
// });
//
// db.connect(function(err) {
//     if (err) {
//         console.error('Error connecting: ' + err.stack);
//         return;
//     }
//     console.log('Connected as id ' + db.threadId);
// });
//
// global.db = db;
// const query = util.promisify(db.query).bind(db);
// global.query = query;

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
      const programList = await dbModule.query(sql);
      console.log(programList);
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

app.get("/home", async function(req, res){


    try{
      let sql = 'SELECT * FROM shows';
      const programList = await dbModule.query(sql);
      console.log(programList);
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

      res.render('home-prova', {
          shows: showList,
          blogs: blogList,
          mixes: mixList
      });

    }catch(e){
      res.status(500).send(e);
    };

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

app.get("/about", async function(req,res){

  try{
    let sqlUser = 'SELECT * FROM users';
    const users = await dbModule.query(sqlUser, req.body.username);
    console.log(users);
    var foundUsers = users.map(v => Object.assign({}, v));
  }catch(e){
    console.log(e);
    next(err);
  }

  console.log(foundUsers);
  res.render("about",{users: foundUsers});

});


// PORTA SERVER
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port);

// app.listen(port, function() {
//
// });

https.createServer(options, app).listen(8080, function(){
  console.log(
  chalk.magenta(figlet.textSync('FutuRadio', { horizontalLayout: 'full' })) +
  chalk.magenta("\nWelcome to FutuRadio website!")
  );
  console.log("\n");
  console.log("------------------------------"+"\nStartup log"+"\n------------------------------");
  console.log("Software running in "+process.env.NODE_ENV+" mode");
  console.log("APPLICATION VARIABLES");
  console.table([{variable: "prova", value: "prova"},{variable: "prova", value: "prova"}]);
  console.log("DB Pool creato con le seguenti configurazioni: "+
              "\n{"+"\n  host: "+ dbModule.config.connectionConfig.host +
              "\n  port:"+dbModule.config.connectionConfig.port+
              "\n  database:"+dbModule.config.connectionConfig.database+
              "\n  user:"+dbModule.config.connectionConfig.user+
              "\n  connectionLimit:"+dbModule.config.connectionLimit+"\n}"
            );
});
