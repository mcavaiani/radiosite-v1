//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-cava:admin123@cluster0-kuomu.mongodb.net/futuradioDB', {useNewUrlParser: true, useUnifiedTopology: true});
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  date: String,
  program: String
});

const Post = mongoose.model('Post', postSchema);

app.get("/", function(req, res){
      res.render("home");
});

app.get("/programmi/:program", function(req, res){
  // console.log(req.params);
  // const stateName = _.camelCase(req.params.program);
  // const title = _.startCase(stateName);

  Post.find({program: req.params.program}).sort({date: 'desc'}).exec(function (err, foundPosts) {
    if (err){
      console.error(err);
    }else{
      console.log(foundPosts);
      res.render(req.params.program,{posts: foundPosts});
    }
  })
});

app.get("/:program/posts/:postId", function(req, res){
  const requestedProgramName = req.params.program;
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

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
