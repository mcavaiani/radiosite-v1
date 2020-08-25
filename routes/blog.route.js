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

router.get("/:blog", momentMiddleware, async function(req, res){
  // console.log(req.params);
  // const stateName = _.camelCase(req.params.program);
  // const title = _.startCase(stateName);

  try{
    let sqlBlog = 'SELECT * FROM shows WHERE stateName = ?';
    const blog = await query(sqlBlog, req.params.blog);
    var foundBlog = blog.map(v => Object.assign({}, v));
    if (!foundBlog.length){res.redirect("/");}
    foundBlog = foundBlog[0];
  }catch(e){
    console.log(e);
    res.redirect("/");
  }

  // try{
    let sqlAuthor = 'SELECT userId FROM usersShows WHERE showId = ?';
    const authorList = await query(sqlAuthor, foundBlog.id);
    const authors = authorList.map(v => Object.assign({}, v));
    console.log(authors);

    let authorsArray = [];
    authors.forEach(element => authorsArray.push(element.userId));
    console.log("Questo è l'array di autori");
    console.log(authorsArray);

    let sqlAuthorInfo = 'SELECT * FROM users WHERE id = ?';
    const authorInfo = await query(sqlAuthorInfo, authorsArray);
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
    const postList = await query(sqlPosts, req.params.blog);
    const postListNew = postList.map(v => Object.assign({}, v));
  // }catch(e){
  //   console.log(e);
  //   res.redirect("/");
  // }

  var foundPosts = postListNew.sort(function(a,b){ return b.postDate.localeCompare(a.postDate);});

  var topPosts = [];
  var oldPosts = [];
  if (foundPosts.length>3){
    topPosts = foundPosts.slice(0,3);
    oldPosts = foundPosts.slice(3);
    console.log("Questo è l'ultimo post");
    console.log(topPosts);
    console.log("Questi sono i post precedenti");
    console.log(oldPosts);
  }else{
    topPosts = foundPosts;
  }

  res.render("blogTemplate",{showName: foundBlog.name, showMen: authorNames, showDescription: foundBlog.description,stateName: foundBlog.stateName, latestPost: topPosts, oldPosts: oldPosts, pType: "blogs"});


  // importedBlog.Blog.findOne({stateName: req.params.blog}, function(err, foundBlog){
  //
  //   if(err){
  //     console.log(err);
  //   }else{
  //     if(foundBlog){
  //       console.log("Found blog");
  //       importedPost.Post.find({program: foundBlog.stateName}).sort({date: 'desc'}).exec(function (err, foundPosts) {
  //         if (err){
  //           console.error(err);
  //         };
  //         console.log("Found posts");
  //         console.log(foundBlog);
  //         console.log(foundPosts);
  //         var topPosts = [];
  //         var oldPosts = [];
  //         if (foundPosts.length>3){
  //           topPosts = foundPosts.slice(0,3);
  //           oldPosts = foundPosts.slice(3);
  //         }else{
  //           topPosts = foundPosts;
  //         }
  //         console.log(topPosts);
  //         console.log(oldPosts);
  //         res.render("blogTemplate",{showName: foundBlog.name, showMan: foundBlog.author, showDescription: foundBlog.description,stateName: foundBlog.stateName, latestPost: topPosts, oldPosts: oldPosts, pType: "blogs"});
  //       })
  //     }else{
  //       res.redirect("/");
  //     }
  //   }
  // });
});

router.get("/:blog/posts/:postId", momentMiddleware, async function(req, res){

  let sqlBlog = 'SELECT * FROM shows WHERE stateName = ?';
  const blog = await query(sqlBlog, req.params.blog);
  var foundBlog = blog.map(v => Object.assign({}, v));
  if (!foundBlog.length){res.redirect("/");}
  foundBlog = foundBlog[0];

  console.log("Blog name is");
  console.log(foundBlog);

  let sqlPost = 'SELECT * FROM posts WHERE program = ? and id = ?';
  const post = await query(sqlPost,[req.params.blog, req.params.postId]);
  var foundPost = post.map(v => Object.assign({}, v));
  if (!foundPost.length){res.redirect("/");}
  foundPost = foundPost[0];

  console.log("Post info");
  console.log(foundPost);

  res.render("post", {
    pageTitle: foundBlog.name,
    stateName: req.params.blog,
    title: foundPost.title,
    content: foundPost.content,
    author: foundPost.author
  });

  //
  // importedBlog.Blog.findOne({stateName: requestedProgramName}, function(err, foundBlog){
  //   if(err){
  //     console.log(err);
  //   }else{
  //     if(foundBlog){
  //       console.log("Found mix");
  //       importedPost.Post.findOne({program: requestedProgramName, _id: requestedPostId}, function(err, foundPost){
  //         if(err){
  //           console.log(err);
  //         }else{
  //           res.render("post", {
  //             pageTitle: foundBlog.name,
  //             stateName: requestedProgramName,
  //             title: foundPost.title,
  //             content: foundPost.content
  //           });
  //         }
  //       })
  //     }else{
  //       res.redirect("/blogs/"+requestedProgramName+"/");
  //     }
  //   }
  // })
});



module.exports = router;
