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
// const moment = require("moment");

var db = mysql.createConnection({
    // host     : 'localhost',
    database : 'futuradiodb',
    user     : 'futuradi_user',
    password : process.env.DBPSW,
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
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser())
app.use(express.json());
//use users route for api/users
app.use("/console", usersRoute);
app.use("/shows", showsRoute);
app.use("/blogs", blogsRoute);
app.use("/mixes", mixesRoute);
app.use("/api", apiRoute);
app.use(express.static("public"));
// app.use((req, res, next)=>{
//     res.locals.moment = moment;
//     next();
// });

mongoose.connect('mongodb+srv://admin-cava:admin123@cluster0-kuomu.mongodb.net/futuradioDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);
const importedUser = require('./models/user.model');
const importedShow = require('./models/show.model');
const importedBlog = require('./models/blog.model');
const importedMix = require('./models/mix.model');
const importedPost = require('./models/post.model');

// const newShow = new Show({
//   name: "Casa Cava",
//   description: "Casa Cava è una figata",
//   author: "Cava",
//   stateName: "casa-cava"
// });

// const newMix = new Mix({
//   name: "I mix di Cava",
//   description: "I mix di Cava sono una figata",
//   author: "Cava",
//   stateName: "i-mix-di-cava"
// });


// newShow.save();
app.get("/", async function(req, res){
  //add quesries for posts, mix and blogs

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



//   var fs = importedShow.Show.find();
//   var fb = importedBlog.Blog.find();
//   var fm = importedMix.Mix.find();
//
//   var resourcesStack = {
//       showList: fs.exec.bind(fs),
//       blogList: fb.exec.bind(fb),
//       mixList: fm.exec.bind(fm)
//   };
//
//   async.parallel(resourcesStack, function (error, resultSet){
//     if (error) {
//         res.status(500).send(error);
//         return;
//     }
//     console.log(resultSet);
//     res.render('home-new', {
//         shows: resultSet.showList,
//         blogs: resultSet.blogList,
//         mixes: resultSet.mixList
//     });
// });

});

app.get("/home", function(req, res){
  //add quesries for posts, mix and blogs

  // const users = await db.query( 'SELECT * FROM users WHERE id = 1' );

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

// Tergeting all articles
// app.route("/articles")
//   .get(function(req, res){
//
//     Article.find({},function(err, foundArticles){
//       if(!err){
//         res.send(foundArticles);
//       }else{
//         res.send(err);
//       }
//     });
//   })
//   .post(function(req, res){
//
//     const newArticle = new Article({
//       title: req.body.title,
//       content: req.body.content
//     });
//     newArticle.save(function(err){
//       if(err){
//         res.send(err);
//       }else{
//         res.status(201).send();
//       }
//     });
//   })
//   .delete(function(req, res){
//
//     Article.deleteMany({},function(err){
//       if(err){
//         res.send(err);
//       }else{
//         res.status(204).send();
//       }
//     });
//   });
//
// // Targeting a specific article
// app.route("/articles/:articleTitle")
//   .get(function(req, res){
//
//     Article.findOne({title: req.params.articleTitle},function(err, foundArticle){
//       if(!err){
//         res.send(foundArticle);
//       }else{
//         res.send(err);
//       }
//     });
//   })
//   .put(function(req, res){
//
//     const newArticle = Article({
//       title: req.body.title,
//       content: req.body.content
//     });
//
//     Article.update(
//       {title: req.params.articleTitle},
//       {title: req.body.title, content: req.body.content},
//       {overwrite: true},
//       function(err, results){
//         if(!err){
//           res.status(204).send();
//         }else{
//           res.send(err);
//         }
//       }
//     );
//   })
//   .patch(function(req, res){
//
//     const newArticle = Article({
//       title: req.body.title,
//       content: req.body.content
//     });
//
//     Article.update(
//       {title: req.params.articleTitle},
//       {$set: req.body},
//       function(err, results){
//         if(!err){
//           res.status(204).send();
//         }else{
//           res.send(err);
//         }
//       }
//     );
//   })
//   .delete(function(req, res){
//
//     Article.deleteOne({title: req.params.articleTitle},function(err){
//       if(err){
//         res.send(err);
//       }else{
//         res.status(204).send();
//       }
//     });
//   });









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

app.listen(port, function() {
  console.log("Server have started");
  console.log(
  chalk.magenta(figlet.textSync('FutuRadio', { horizontalLayout: 'full' })) +
  chalk.magenta("\nWelcome to FutuRadio website!")
  );
});
