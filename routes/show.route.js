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
const util = require('util');

router.get("/:show", momentMiddleware, async function(req, res){
  // console.log(req.params);
  // const stateName = _.camelCase(req.params.program);
  // const title = _.startCase(stateName);

  // try{
    let sqlShow = 'SELECT * FROM shows WHERE stateName = ?';
    const show = await query(sqlShow, req.params.show);
    var foundShow = show.map(v => Object.assign({}, v));
    foundShow = foundShow[0];
  // }catch(e){
  //   console.log(e);
  //   res.redirect("/");
  // }

  // try{
    let sqlAuthor = 'SELECT userId FROM usersShows WHERE showId = ?';
    const authorList = await query(sqlAuthor, foundShow.id);
    const authors = authorList.map(v => Object.assign({}, v));
  // }catch(e){
  //   console.log(e);
  //   res.redirect("/");
  // }

  let authorsArray = [];
  authors.forEach(element => authorsArray.push(element.userId));

  let sqlAuthorInfo = 'SELECT * FROM users WHERE id = ?';
  const authorInfo = await query(sqlAuthorInfo, authorsArray);
  const authorsInfoList = authorInfo.map(v => Object.assign({}, v));

  let authorNames = [];
  authorsInfoList.forEach(element => authorNames.push(element.nickName));

  // try{
    let sqlPosts = 'SELECT * FROM posts WHERE program = ?';
    const postList = await query(sqlPosts, req.params.show);
    const postListNew = postList.map(v => Object.assign({}, v));
  // }catch(e){
  //   console.log(e);
  //   res.redirect("/");
  // }

  var foundPosts = postListNew.sort(function(a,b){ return b.postDate.localeCompare(a.postDate);});
  console.log("Ecco tutti i post di "+req.params.show);
  console.log(foundPosts);

  var topPosts = [];
  var oldPosts = [];
  if (foundPosts.length>1){
    topPosts = foundPosts.slice(0,1);
    oldPosts = foundPosts.slice(1);
  }else{
    topPosts = foundPosts;
  }

  res.render("programTemplate",{showName: foundShow.name, showMen: authorNames, showDescription: foundShow.description,stateName: foundShow.stateName, latestPost: topPosts, oldPosts: oldPosts, pType: "shows"});

  // importedShow.Show.findOne({stateName: req.params.show}, function(err, foundShow){
  //
  //   if(err){
  //     console.log(err);
  //   }else{
  //     if(foundShow){
  //       console.log("Found show");
  //       importedPost.Post.find({program: foundShow.stateName}).sort({date: 'desc'}).exec(function (err, foundPosts) {
  //         if (err){
  //           console.error(err);
  //         };
  //         console.log("Found posts");
  //         console.log(foundShow);
  //         console.log(foundPosts);
  //         var topPosts = [];
  //         var oldPosts = [];
  //         if (foundPosts.length>1){
  //           topPosts = foundPosts.slice(0,1);
  //           oldPosts = foundPosts.slice(1);
  //         }else{
  //           topPosts = foundPosts;
  //         }
  //         console.log(topPosts);
  //         console.log(oldPosts);
  //         res.render("programTemplate",{showName: foundShow.name, showMan: foundShow.author, showDescription: foundShow.description,stateName: foundShow.stateName, latestPost: topPosts, oldPosts: oldPosts, pType: "shows"});
  //       })
  //     }else{
  //       res.redirect("/");
  //     }
  //   }
  //
  // });
});

router.get("/:show/posts/:postId", momentMiddleware, function(req, res){
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
