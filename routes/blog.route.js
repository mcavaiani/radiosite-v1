const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user.model");
const importedPost = require("../models/post.model");
const importedShow = require("../models/show.model");
const importedBlog = require("../models/blog.model");
const importedMix = require("../models/mix.model");
const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const momentMiddleware = require("../middleware/momentMiddleware");

router.get("/:blog", momentMiddleware, function(req, res){
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
          res.render("blogTemplate",{showName: foundBlog.name, showMan: foundBlog.author, showDescription: foundBlog.description,stateName: foundBlog.stateName, latestPost: topPosts, oldPosts: oldPosts, pType: "blogs"});
        })
      }else{
        res.redirect("/");
      }
    }
  });
});

router.get("/:blog/posts/:postId", momentMiddleware, function(req, res){
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



module.exports = router;
