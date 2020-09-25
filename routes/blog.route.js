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

router.get("/:blog", momentMiddleware, async function(req, res){

  try{
    let sqlBlog = 'SELECT * FROM shows WHERE stateName = ?';
    const blog = await dbModule.query(sqlBlog, req.params.blog);
    var foundBlog = blog.map(v => Object.assign({}, v));
    if (!foundBlog.length){res.redirect("/");}
    foundBlog = foundBlog[0];
  }catch(e){
    console.log(e);
    res.redirect("/");
  }

  
    let sqlAuthor = 'SELECT userId FROM usersShows WHERE showId = ?';
    const authorList = await dbModule.query(sqlAuthor, foundBlog.id);
    const authors = authorList.map(v => Object.assign({}, v));

    let authorsArray = [];
    authors.forEach(element => authorsArray.push(element.userId));

    let sqlAuthorInfo = 'SELECT * FROM users WHERE id = ?';
    const authorInfo = await dbModule.query(sqlAuthorInfo, authorsArray);
    const authorsInfoList = authorInfo.map(v => Object.assign({}, v));

    let authorNames = [];
    authorsInfoList.forEach(element => authorNames.push(element.nickName));

    let sqlPosts = 'SELECT * FROM posts WHERE program = ?';
    const postList = await dbModule.query(sqlPosts, req.params.blog);
    const postListNew = postList.map(v => Object.assign({}, v));

  var foundPosts = postListNew.sort(function(a,b){ return b.postDate.localeCompare(a.postDate);});

  var topPosts = [];
  var oldPosts = [];
  if (foundPosts.length>3){
    topPosts = foundPosts.slice(0,3);
    oldPosts = foundPosts.slice(3);
  }else{
    topPosts = foundPosts;
  }

  res.render("blogTemplate",{showName: foundBlog.name, showMen: authorNames, showDescription: foundBlog.description,stateName: foundBlog.stateName, latestPost: topPosts, oldPosts: oldPosts, pType: "blogs"});
});

router.get("/:blog/posts/:postId", momentMiddleware, async function(req, res){

  let sqlBlog = 'SELECT * FROM shows WHERE stateName = ?';
  const blog = await dbModule.query(sqlBlog, req.params.blog);
  var foundBlog = blog.map(v => Object.assign({}, v));
  if (!foundBlog.length){res.redirect("/");}
  foundBlog = foundBlog[0];

  let sqlPost = 'SELECT * FROM posts WHERE program = ? and id = ?';
  const post = await dbModule.query(sqlPost,[req.params.blog, req.params.postId]);
  var foundPost = post.map(v => Object.assign({}, v));
  if (!foundPost.length){res.redirect("/");}
  foundPost = foundPost[0];

  let sqlPostImgs = 'SELECT * FROM postImages WHERE post = ?';
  const images = await dbModule.query(sqlPostImgs,req.params.postId);
  var foundImgs = images.map(v => Object.assign({}, v));

  res.render("post", {
    pageTitle: foundBlog.name,
    stateName: req.params.blog,
    postInfo: foundPost,
    images: foundImgs
  });

});

module.exports = router;
