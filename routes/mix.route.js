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

router.get("/:mix", momentMiddleware, function(req, res){
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
          res.render("mixTemplate",{showName: foundMix.name, showMan: foundMix.author, showDescription: foundMix.description,stateName: foundMix.stateName, latestPost: topPosts, oldPosts: oldPosts, pType: "mixes"});
        })
      }else{
        res.redirect("/");
      }
    }
  });
});

router.get("/:mix/posts/:postId", momentMiddleware, function(req, res){
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




module.exports = router;
