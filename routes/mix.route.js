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
const dbModule = require('../db/dbModule');

router.get("/:mix", momentMiddleware, async function(req, res){
  // console.log(req.params);
  // const stateName = _.camelCase(req.params.program);
  // const title = _.startCase(stateName);

  try{
    let sqlMix = 'SELECT * FROM shows WHERE stateName = ?';
    const mix = await dbModule.query(sqlMix, req.params.mix);
    var foundMix = mix.map(v => Object.assign({}, v));
    if (!foundMix.length){res.redirect("/");}
    foundMix = foundMix[0];
  }catch(e){
    console.log(e);
    res.redirect("/");
  }

  // try{
    let sqlAuthor = 'SELECT userId FROM usersShows WHERE showId = ?';
    const authorList = await dbModule.query(sqlAuthor, foundMix.id);
    const authors = authorList.map(v => Object.assign({}, v));
    console.log(authors);

    let authorsArray = [];
    authors.forEach(element => authorsArray.push(element.userId));
    console.log("Questo è l'array di autori");
    console.log(authorsArray);

    let sqlAuthorInfo = 'SELECT * FROM users WHERE id = ?';
    const authorInfo = await dbModule.query(sqlAuthorInfo, authorsArray);
    const authorsInfoList = authorInfo.map(v => Object.assign({}, v));
    console.log("PROVA QUERY PER AUTORI");
    console.log(authorsInfoList);

    let authorNames = [];
    authorsInfoList.forEach(element => authorNames.push(element.nickName));
    console.log("PROVA QUERY PER AUTORI");
    console.log(authorNames);



  // }catch(e){
  //   console.log(e);
  //   res.redirect("/");
  // }

  // try{
    let sqlPosts = 'SELECT * FROM posts WHERE program = ?';
    const postList = await dbModule.query(sqlPosts, req.params.mix);
    const postListNew = postList.map(v => Object.assign({}, v));
  // }catch(e){
  //   console.log(e);
  //   res.redirect("/");
  // }

  var foundPosts = postListNew.sort(function(a,b){ return b.postDate.localeCompare(a.postDate);});

  var topPosts = [];
  var oldPosts = [];
  if (foundPosts.length>1){
    topPosts = foundPosts.slice(0,1);
    oldPosts = foundPosts.slice(1);
    console.log("Questo è l'ultimo post");
    console.log(topPosts);
    console.log("Questi sono i post precedenti");
    console.log(oldPosts);
  }else{
    topPosts = foundPosts;
  }

  res.render("mixTemplate",{showName: foundMix.name, showMan: authorNames, showDescription: foundMix.description, sourceLink: foundMix.source, stateName: foundMix.stateName, latestPost: topPosts, oldPosts: oldPosts, pType: "mixes"});

  // importedMix.Mix.findOne({stateName: req.params.mix}, function(err, foundMix){
  //
  //   if(err){
  //     console.log(err);
  //   }else{
  //     if(foundMix){
  //       console.log("Found mix");
  //       importedPost.Post.find({program: foundMix.stateName}).sort({date: 'desc'}).exec(function (err, foundPosts) {
  //         if (err){
  //           console.error(err);
  //         };
  //         console.log("Found posts");
  //         console.log(foundMix);
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
  //         res.render("mixTemplate",{showName: foundMix.name, showMan: foundMix.author, showDescription: foundMix.description,stateName: foundMix.stateName, latestPost: topPosts, oldPosts: oldPosts, pType: "mixes"});
  //       })
  //     }else{
  //       res.redirect("/");
  //     }
  //   }
  // });
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
