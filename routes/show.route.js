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
const moment = require("moment");


router.get("/:show", function(req, res){
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



// router.get("/register", function(req, res) {
//   res.render("register");
// });


// router.get("/admin-console/user", auth, async (req, res)=>{
//
//   let user = await User.findOne({
//     _id: req.user.id
//   });
//
//   res.render("user", {userInfo:user});
// })





//
//
// router.get("/current", auth, async (req, res) => {
//   const user = await User.findById(req.user._id).select("-password");
//   res.send(user);
// });

module.exports = router;
