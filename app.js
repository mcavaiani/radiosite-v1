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
app.get("/", function(req, res){
  //add quesries for posts, mix and blogs

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
    console.log(resultSet);
    res.render('home-new', {
        shows: resultSet.showList,
        blogs: resultSet.blogList,
        mixes: resultSet.mixList
    });
});

});

app.get("/home", function(req, res){
  //add quesries for posts, mix and blogs

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

  importedShow.Show.findOne({stateName: req.params.show}, function(err, foundShow){

    if(err){
      console.log(err);
    }else{
      if(foundShow){
        console.log("Found show");
        importedPost.Post.find({program: foundShow.stateName}).sort({date: 'desc'}).exec(function (err, foundPosts) {
          if (err){
            console.error(err);
          };
          console.log("Found posts");
          console.log(foundShow);
          console.log(foundPosts);
          var topPosts = [];
          var oldPosts = [];
          if (foundPosts.length>1){
            topPosts = foundPosts.slice(0,1);
            oldPosts = foundPosts.slice(1);
          }else{
            topPosts = foundPosts;
          }
          console.log(topPosts);
          console.log(oldPosts);
          res.render("programTemplate",{showName: foundShow.name, showMan: foundShow.author, showDescription: foundShow.description,stateName: foundShow.stateName, latestPost: topPosts, oldPosts: oldPosts});
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

  importedBlog.Blog.findOne({stateName: req.params.blog}, function(err, foundBlog){

    if(err){
      console.log(err);
    }else{
      if(foundBlog){
        console.log("Found blog");
        importedPost.Post.find({program: foundBlog.stateName}).sort({date: 'desc'}).exec(function (err, foundPosts) {
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

app.get("/mixes/:mix", function(req, res){
  // console.log(req.params);
  // const stateName = _.camelCase(req.params.program);
  // const title = _.startCase(stateName);

  importedMix.Mix.findOne({stateName: req.params.mix}, function(err, foundMix){

    if(err){
      console.log(err);
    }else{
      if(foundMix){
        console.log("Found mix");
        importedPost.Post.find({program: foundMix.stateName}).sort({date: 'desc'}).exec(function (err, foundPosts) {
          if (err){
            console.error(err);
          };
          console.log("Found posts");
          console.log(foundMix);
          console.log(foundPosts);
          var topPosts = [];
          var oldPosts = [];
          if (foundPosts.length>1){
            topPosts = foundPosts.slice(0,1);
            oldPosts = foundPosts.slice(1);
          }else{
            topPosts = foundPosts;
          }
          console.log(topPosts);
          console.log(oldPosts);
          res.render("mixTemplate",{showName: foundMix.name, showMan: foundMix.author, showDescription: foundMix.description,stateName: foundMix.stateName, latestPost: topPosts, oldPosts: oldPosts});
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

  importedShow.Show.findOne({stateName: requestedProgramName}, function(err, foundShow){
    if(err){
      console.log(err);
    }else{
      if(foundShow){
        console.log("Found show");
        importedPost.Post.findOne({program: requestedProgramName, _id: requestedPostId}, function(err, foundPost){
          if(err){
            console.log(err);
          }else{
            res.render("post", {
              pageTitle: foundShow.name,
              stateName: requestedProgramName,
              title: foundPost.title,
              content: foundPost.content
            });
          }
        })
      }else{
        res.redirect("/shows/"+requestedProgramName+"/");
      }
    }
  })
});

app.get("/mixes/:mix/posts/:postId", function(req, res){
  const requestedProgramName = req.params.mix;
  const requestedPostId = req.params.postId;

  importedMix.Mix.findOne({stateName: requestedProgramName}, function(err, foundMix){
    if(err){
      console.log(err);
    }else{
      if(foundMix){
        console.log("Found show");
        importedPost.Post.findOne({program: requestedProgramName, _id: requestedPostId}, function(err, foundPost){
          if(err){
            console.log(err);
          }else{
            res.render("post", {
              pageTitle: foundMix.name,
              stateName: requestedProgramName,
              title: foundPost.title,
              content: foundPost.content
            });
          }
        })
      }else{
        res.redirect("/mixes/"+requestedProgramName+"/");
      }
    }
  })
});


app.get("/blogs/:blog/posts/:postId", function(req, res){
  const requestedProgramName = req.params.blog;
  const requestedPostId = req.params.postId;

  importedBlog.Blog.findOne({stateName: requestedProgramName}, function(err, foundBlog){
    if(err){
      console.log(err);
    }else{
      if(foundBlog){
        console.log("Found mix");
        importedPost.Post.findOne({program: requestedProgramName, _id: requestedPostId}, function(err, foundPost){
          if(err){
            console.log(err);
          }else{
            res.render("post", {
              pageTitle: foundBlog.name,
              stateName: requestedProgramName,
              title: foundPost.title,
              content: foundPost.content
            });
          }
        })
      }else{
        res.redirect("/blogs/"+requestedProgramName+"/");
      }
    }
  })
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
