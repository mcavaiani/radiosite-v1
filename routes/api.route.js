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
const _ = require('lodash');
const dbModule = require('../db/dbModule');

router.get("/podcastList", async function(req, res){

  try{
    let sqlPodcastList = 'SELECT * FROM shows WHERE type = ?';
    const podcasts = await dbModule.query(sqlPodcastList, 'podcast');
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
    const blogs = await dbModule.query(sqlBlogList, 'blog');
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
    const mixes = await dbModule.query(sqlMixList, 'mix');
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
    const user = await dbModule.query(sqlUserInfo, userId);
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
    const users = await dbModule.query(sqlUsers);
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
    const user = await dbModule.query(sqlUpUser,userId);
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
    const userToUpdate = await dbModule.query(sqlUpdateUser,[updatedUser.nickName, updatedUser.description, updatedUser.pictureUrl, updatedUser.facebook, updatedUser.instagram, updatedUser.twitter, updatedUser.isAdmin, updatedUser.toBeShown, updatedUser.id], function (err, result) {
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
    const user = await dbModule.query(sqlUpUser,userId);
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
    const userToUpdate = await dbModule.query(sqlUpdateUser,[updatedUser.password, updatedUser.id], function (err, result) {
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
  console.log("Siamo entrati nella apiiiii");
  try{
    let sqlPage = 'SELECT * FROM shows WHERE id = ?';
    const page = await dbModule.query(sqlPage,req.params.pageId);
    var foundPage = page.map(v => Object.assign({}, v));
    foundPage = foundPage[0];
  }catch(e){
    console.log(e);
    next(err);
  }
  console.log("select ok")

  if(!foundPage)
    res.status(404).send("Page not found");
  try{
    let sqlUserPage = "DELETE FROM usersShows WHERE showId = ?";
    const userPageDeleted = await dbModule.query(sqlUserPage, req.params.pageId);
    console.log(userPageDeleted.affectedRows + " record(s) updated");
  }catch(e){
    console.log(e);
    next(err);
  }
    console.log("Eliminato da usersShows");
  try{
    let sqlPageDeleted = "DELETE FROM shows WHERE id = ?";
    const pageDeleted = await dbModule.query(sqlPageDeleted, req.params.pageId);
    console.log(pageDeleted.affectedRows + " record(s) updated");
    console.log("Eliminato da shows");

    res.status(200).send("OK");
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
    const page = await dbModule.query(sqlPage,req.params.pageId);
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
  if(req.body.sourceLink) updatedPage.source = req.body.sourceLink;
  if(req.body.type) updatedPage.type = req.body.type;

  try{
    let sqlUpdatePage = "UPDATE shows SET name = ?, description = ?, stateName = ?, source = ?, type = ? WHERE id = ?";
    const userToUpdate = await dbModule.query(sqlUpdatePage,[updatedPage.name, updatedPage.description, updatedPage.stateName, updatedPage.source, updatedPage.type, updatedPage.id], function (err, result) {
      if (err) throw err;
        console.log(result.affectedRows + " record(s) updated");
      res.status(200).send("OK");
    });
  }catch(e){
    console.log(e);
    next(err);
  }

});

router.post("/page/create", auth, async function(req, res){

// kebabcase
var stateName = _.kebabCase(req.body.programName);

  try{
    let sqlPage = 'SELECT * FROM shows WHERE stateName = ?';
    const show = await dbModule.query(sqlPage,stateName);
    var foundShow = show.map(v => Object.assign({}, v));
    if (foundShow.length){res.status(406).send("Pagina già esistente");}
  }catch(e){
    console.log(e);
    next(err);
  }

  var newShow = "";
  try{
    let sqlNewPage = 'INSERT INTO shows(name, description, stateName, source, type) VALUES ('+"'"+ req.body.programName+"'"+','+ "'"+req.body.description+"'"+','+"'"+ stateName+"'"+','+"'"+ req.body.sourceLink +"'"+','+"'"+req.body.type +"'"+ ')';
    console.log("INSERT per il nuovo programma: ", sqlNewPage);
    newShow = await dbModule.query(sqlNewPage);
    // FIX ME
    console.log("vediamo cosa restituisce", newShow);

  }catch(e){
    console.log(e);
    next(err);
    res.status(500).send("Qualcosa è andato storto");
  }

  try{
    let sqlUser = 'SELECT id FROM users WHERE nickName = ?';
    const user = await dbModule.query(sqlUser,req.body.nickName);
    var foundUserId = user.map(v => Object.assign({}, v));
    foundUserId = foundUserId[0];
    console.log(foundUserId);
  }catch(e){
    console.log(e);
    next(err);
  }

  try{
    let sqlNewLink = 'INSERT INTO usersShows(userId, showId) VALUES ('+"'"+ foundUserId.id+"'"+','+ "'"+newShow.insertId+"'"+ ')';
    console.log("INSERT per il nuovo programma: ", sqlNewLink);
    const newLink = await dbModule.query(sqlNewLink);
    console.log("vediamo cosa restituisce", newLink);
    res.status(200).send("OK");
  }catch(e){
    console.log(e);
    next(err);
    res.status(500).send("Qualcosa è andato storto");
  }

});

module.exports = router;
