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

router.get("/podcastList", async function(req, res){

  try{
    let sqlPodcastList = 'SELECT * FROM shows WHERE type = ?';
    const podcasts = await query(sqlPodcastList, 'podcast');
    var foundPodcasts = podcasts.map(v => Object.assign({}, v));
    res.json(foundPodcasts);
  }catch(e){
    console.log(e);
    next(err);
  }
});

router.get("/blogList", async function(req, res){

  try{
    let sqlBlogList = 'SELECT * FROM shows WHERE type = ?';
    const blogs = await query(sqlBlogList, 'blog');
    var foundBlog = blogs.map(v => Object.assign({}, v));
    res.json(foundBlog);
  }catch(e){
    console.log(e);
    next(err);
  }
});

router.get("/mixList", async function(req, res){

  try{
    let sqlMixList = 'SELECT * FROM shows WHERE type = ?';
    const mixes = await query(sqlMixList, 'mix');
    var foundMixes = mixes.map(v => Object.assign({}, v));
    res.json(foundMixes);
  }catch(e){
    console.log(e);
    next(err);
  }
});

router.get("/user/:id?", auth, async function(req, res){

  var userId = "";
  if (req.params.id){
    userId = req.params.id;
  }else{
    userId =  req.user.id;
  }

  try{
    let sqlUserInfo = 'SELECT * FROM users WHERE id = ?';
    const user = await query(sqlUserInfo, userId);
    var foundUser = user.map(v => Object.assign({}, v));
    foundUser = foundUser[0];

    delete foundUser.password;

    if (!req.user.isAdmin){
      delete foundUser.isAdmin;
      delete foundUser.toBeShown;
      delete foundUser.username;
      delete foundUser.email;
    }

    res.json(foundUser);
  }catch(e){
    console.log(e);
    next(err);
  }
});

router.get("/users", auth, async function(req, res){
  try{
    let sqlUsers = 'SELECT * FROM users';
    const users = await query(sqlUsers);
    var foundUsers = users.map(v => Object.assign({}, v));
    foundUsers.forEach(user => delete user.password);

    res.json(foundUsers);
  }catch(e){
    console.log(e);
    next(err);
  }
});

router.put("/user/:id?", auth, async function(req, res){

  var userId = "";
  if (req.params.id){
    userId = req.params.id;
  }else{
    userId =  req.user.id;
  }

  try{
    let sqlUpUser = 'SELECT * FROM users WHERE id = ?';
    const user = await query(sqlUpUser,userId);
    var foundUser = user.map(v => Object.assign({}, v));
    foundUser = foundUser[0];
  }catch(e){
    console.log(e);
    next(err);
  }

  if(!foundUser)
    res.status(404).send("User not found");

  var updatedUser = foundUser;
  console.log("Request body: ", req.body);
  if(req.body.nickName) updatedUser.nickName = req.body.nickName;
  if(req.body.description) updatedUser.description = req.body.description;
  if(req.body.pictureUrl) updatedUser.pictureUrl = req.body.pictureUrl;
  if(req.body.facebook) updatedUser.facebook = req.body.facebook;
  if(req.body.instagram) updatedUser.instagram = req.body.instagram;
  if(req.body.twitter) updatedUser.twitter = req.body.twitter;
  if(req.body.isAdmin) updatedUser.isAdmin = req.body.isAdmin;
  if(req.body.toBeShown) updatedUser.toBeShown = req.body.toBeShown;

  try{
    let sqlUpdateUser = "UPDATE users SET nickName = ?, description = ?, pictureUrl = ?, facebook = ?, instagram = ?, twitter = ?, isAdmin = ?, toBeShown = ? WHERE id = ?";
    const userToUpdate = await query(sqlUpdateUser,[updatedUser.nickName, updatedUser.description, updatedUser.pictureUrl, updatedUser.facebook, updatedUser.instagram, updatedUser.twitter, updatedUser.isAdmin, updatedUser.toBeShown, updatedUser.id], function (err, result) {
      if (err) throw err;
      console.log(result.affectedRows + " record(s) updated");
      res.status(200).send("OK");
    });
  }catch(e){
    console.log(e);
    next(err);
  }
});

module.exports = router;
