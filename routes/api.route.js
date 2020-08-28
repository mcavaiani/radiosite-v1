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

router.put("/user/:id?/credentials", auth, async function(req, res){

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

  var passwordIsValid = bcrypt.compareSync(
    req.body.oldPassword,
    foundUser.password
  );

  if (!passwordIsValid) {
    return res.status(401).send({
      message: "Invalid old password!"
    });
  };

  if (req.body.newPassword != req.body.newPasswordRepeat){
    return res.status(401).send({
      message: "New passwords are different!"
    });
  };

  var updatedUser = foundUser;
  updatedUser.password = await bcrypt.hash(req.body.newPassword, 10);

  try{
    let sqlUpdateUser = "UPDATE users SET password = ? WHERE id = ?";
    const userToUpdate = await query(sqlUpdateUser,[updatedUser.password, updatedUser.id], function (err, result) {
      if (err) throw err;
      console.log(result.affectedRows + " record(s) updated");
      res.status(200).send("OK");
    });
  }catch(e){
    console.log(e);
    next(err);
  }
});

router.delete("/page/:pageId", auth, async function(req, res){

  if (!req.params.pageId){
    return res.status(401).send({
      message: "Missing page id!"
    });
  }

  try{
    let sqlPage = 'SELECT * FROM shows WHERE id = ?';
    const page = await query(sqlPage,userId);
    var foundPage = page.map(v => Object.assign({}, v));
    foundPage = foundPage[0];
  }catch(e){
    console.log(e);
    next(err);
  }

  if(!foundPage)
    res.status(404).send("Page not found");

  try{
    let sqlPageDeletd = "DELETE FROM shows WHERE id = ?";
    const pageDeleted = await query(sqlPageDeletd, req.params.pageId, function (err, result) {
      if (err) throw err;
      console.log(result.affectedRows + " record(s) updated");
    });

    let sqlUserPage = "DELETE FROM usersShows WHERE showId = ?";
    const userPageDeleted = await query(sqlUserPage, req.params.pageId, function (err, result) {
      if (err) throw err;
      console.log(result.affectedRows + " record(s) updated");
      res.status(200).send("OK");
    });

  }catch(e){
    console.log(e);
    next(err);
  }

});

router.put("/page/:pageId", auth, async function(req, res){

  if (!req.params.pageId){
    return res.status(401).send({
      message: "Page does not exists!"
    });
  }

  try{
    let sqlPage = 'SELECT * FROM shows WHERE id = ?';
    const page = await query(sqlPage,userId);
    var foundPage = page.map(v => Object.assign({}, v));
    foundPage = foundPage[0];
  }catch(e){
    console.log(e);
    next(err);
  }

  if(!foundPage)
    res.status(404).send("Page not found");

  var updatedPage = foundPage;
  console.log("Request body: ", req.body);
  if(req.body.name) updatedPage.name = req.body.name;
  if(req.body.description) updatedPage.description = req.body.description;
  if(req.body.stateName) updatedPage.stateName = req.body.stateName;
  if(req.body.source) updatedPage.source = req.body.source;
  if(req.body.type) updatedPage.type = req.body.type;

  try{
    let sqlUpdatePage = "UPDATE users SET name = ?, description = ?, stateName = ?, source = ?, type = ? WHERE id = ?";
    const userToUpdate = await query(sqlUpdatePage,[updatedPage.name, updatedPage.description, updatedPage.stateName, updatedPage.source, updatedPage.type, updatedPage.id], function (err, result) {
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
