//jshint esversion:6
require('dotenv').config();
const config = require("config");
const express = require("express");
const usersRoute = require("./routes/console.route");
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
const moment = require("moment");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser())
app.use(express.json());
//use users route for api/users
app.use("/console", usersRoute);
app.use(express.static("public"));
app.use((req, res, next)=>{
    res.locals.moment = moment;
    next();
  });




// app.use(session({
//   secret: process.env.SECRETKEY,
//   resave: false,
//   saveUninitialized: false
// }));

// app.use(passport.initialize());
// app.use(passport.session());

mongoose.connect('mongodb+srv://admin-cava:admin123@cluster0-kuomu.mongodb.net/futuradioDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);
const importedUser = require('./models/user.model');


// const userSchema = new mongoose.Schema({
//   // email: String,
//   username: String,
//   password: String
//   // name: String,
//   // lastName: String,
//   // nickName: String,
//   // description: String,
//   // pictureUrl: String,
//   // facebook: String,
//   // instragram: String,
//   // twitter: String,
//   // tiktok: String
// });

// userSchema.plugin(passportLocalMongoose);
// const User = new mongoose.model("User", userSchema);

// passport.use(User.createStrategy());
//
// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });
//
// passport.deserializeUser(function(id, done) {
//   User.findById(id, function(err, user) {
//     done(err, user);
//   });
// });

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  date: String,
  program: String,
  previewPicture: String
});

const showSchema = new mongoose.Schema({
  name: String,
  description: String,
  author: String,
  stateName: String
});

const blogSchema = new mongoose.Schema({
  name: String,
  description: String,
  author: String,
  stateName: String
});

const mixSchema = new mongoose.Schema({
  name: String,
  description: String,
  author: String,
  stateName: String
});

const Show = mongoose.model('Show',showSchema);
const Blog = mongoose.model('Blog',blogSchema);
const Mix = mongoose.model('Mix',mixSchema);
const Post = mongoose.model('Post', postSchema);

const newShow = new Show({
  name: "Casa Cava",
  description: "Casa Cava è una figata",
  author: "Cava",
  stateName: "casa-cava"
});

const newMix = new Mix({
  name: "I mix di Cava",
  description: "I mix di Cava sono una figata",
  author: "Cava",
  stateName: "i-mix-di-cava"
});


// newShow.save();
app.get("/", function(req, res){
  //add quesries for posts, mix and blogs

  var fs = Show.find();
  var fb = Blog.find();
  var fm = Mix.find();

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
    console.log(resultSet);
    res.render('home', {
        shows: resultSet.showList,
        blogs: resultSet.blogList,
        mixes: resultSet.mixList
    });
});

});

app.get("/home", function(req, res){
  //add quesries for posts, mix and blogs

  var fs = Show.find();
  var fb = Blog.find();
  var fm = Mix.find();

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
    console.log(resultSet);
    res.render('home-new', {
        shows: resultSet.showList,
        blogs: resultSet.blogList,
        mixes: resultSet.mixList
    });
});

});

// SEZIONE PROGRAMMI

// app.get("/programmi/:program", function(req, res){
//   // console.log(req.params);
//   // const stateName = _.camelCase(req.params.program);
//   // const title = _.startCase(stateName);
//
//   Post.find({program: req.params.program}).sort({date: 'desc'}).exec(function (err, foundPosts) {
//     if (err){
//       console.error(err);
//     }else{
//       console.log(foundPosts);
//       res.render(req.params.program,{posts: foundPosts});
//     }
//   })
// });

app.get("/shows/:show", function(req, res){
  // console.log(req.params);
  // const stateName = _.camelCase(req.params.program);
  // const title = _.startCase(stateName);

  Show.findOne({stateName: req.params.show}, function(err, foundShow){

    if(err){
      console.log(err);
    }else{
      if(foundShow){
        console.log("Found show");
        Post.find({program: foundShow.stateName}).sort({date: 'desc'}).exec(function (err, foundPosts) {
          if (err){
            console.error(err);
          };
          console.log("Found posts");
          console.log(foundShow);
          console.log(foundPosts);
          res.render("programTemplate",{showName: foundShow.name, showMan: foundShow.author, showDescription: foundShow.description,stateName: foundShow.stateName, latestPost: [foundPosts.shift()], oldPosts: foundPosts});
        })
      }else{
        res.redirect("/");
      }
    }

  });
});

app.get("/blogs/:blog", function(req, res){
  // console.log(req.params);
  // const stateName = _.camelCase(req.params.program);
  // const title = _.startCase(stateName);

  Blog.findOne({stateName: req.params.blog}, function(err, foundBlog){

    if(err){
      console.log(err);
    }else{
      if(foundBlog){
        console.log("Found blog");
        Post.find({program: foundBlog.stateName}).sort({date: 'desc'}).exec(function (err, foundPosts) {
          if (err){
            console.error(err);
          };
          console.log("Found posts");
          console.log(foundBlog);
          console.log(foundPosts);
          var topPosts = [];
          var oldPosts = [];
          if (foundPosts.length>3){
            topPosts = foundPosts.slice(0,3);
            oldPosts = foundPosts.slice(3);
          }else{
            topPosts = foundPosts;
          }
          console.log(topPosts);
          console.log(oldPosts);
          res.render("blogTemplate",{showName: foundBlog.name, showMan: foundBlog.author, showDescription: foundBlog.description,stateName: foundBlog.stateName, latestPost: topPosts, oldPosts: oldPosts});
        })
      }else{
        res.redirect("/");
      }
    }
  });
});

app.get("/shows/:show/posts/:postId", function(req, res){
  const requestedProgramName = req.params.show;
  const requestedPostId = req.params.postId;

  Post.findOne({program: requestedProgramName, _id: requestedPostId}, function(err, foundPost){
    res.render("post", {
      pageTitle: foundPost.program,
      title: foundPost.title,
      content: foundPost.content
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


// LOGIN
// app.route("/login")
//   .get(function(req,res){
//     res.render("login");
//   })
//   .post(function(req, res){
//
//     const user = new User({
//       username: req.body.username,
//       password: req.body.password
//     });
//
//     req.login(user, function(err){
//       if (err){
//         console.log(err);
//         res.redirect("/login");
//       }else{
//         passport.authenticate("local");
//         res.redirect("/adminConsole");
//       }
//     });
//   });

// REGISTRAZIONE
// app.route("/register")
//   .get(function(req, res){
//     res.render("register");
//   })
//   .post(function(req, res){
//
//     User.register({username: req.body.username}, req.body.password, function(err,user){
//       if(err){
//         console.log(err);
//         res.redirect("/register");
//       }else{
//         passport.authenticate("local")(req,res,function(){
//           res.redirect("/");
//         })
//       }
//     });
//   })

// LOGOUT
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});


// app.get("/adminConsole", function(req, res){
//   passport.authenticate("local");
//   res.render("adminConsole");
// })


app.get("/adminConsole/user", function(req,res){
  res.render("user");
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

app.listen(port, function() {
  console.log("Server have started");
  console.log(
  chalk.magenta(figlet.textSync('FutuRadio', { horizontalLayout: 'full' })) +
  chalk.magenta("\nWelcome to FutuRadio website!")
  );
});
