const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user.model");
const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');

router.get("/register", function(req, res) {
  res.render("register");
});

router.post("/register", async (req, res) => {

  // validate the request body first
  const {
    error
  } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //find an existing user
  let user = await User.findOne({
    username: req.body.username
  });
  if (user) return res.status(400).send("User already registered.");

  user = new User({
    username: req.body.username,
    password: req.body.password
  });

  user.password = await bcrypt.hash(user.password, 10);
  await user.save();

  const token = user.generateAuthToken();
  res.set("x-access-token", token);
  res.redirect("/console/admin-console");

});

router.get("/login", function(req, res) {

  //add check jwt before render login
  res.render("login");
});

router.post("/login", async (req, res) => {

  try{
    let sqlUser = 'SELECT * FROM users WHERE userName = ?';
    const user = await query(sqlUser, req.body.username);
    var foundUser = user.map(v => Object.assign({}, v));
    foundUser = foundUser[0];
  }catch(e){
    console.log(e);
    next(err);
  }
  console.log("Found user", foundUser);

  if (!foundUser){
    return res.status(401).send({
      accessToken: null,
      message: "Invalid username!"
    });
  }
  var passwordIsValid = bcrypt.compareSync(
    req.body.password,
    foundUser.password
  );

  if (!passwordIsValid) {
    return res.status(401).send({
      accessToken: null,
      message: "Invalid password!"
    });
  };
  var token = jwt.sign({
    id: foundUser.id,
    username: foundUser.username,
    isAdmin: foundUser.isAdmin
  }, process.env.SECRETKEY, {
    expiresIn: 3600 // 1 hour
  });
  res.cookie("access-token", token, { httpOnly: true, secure: true});
  res.redirect("/console/admin-console");
});

router.get("/logout",function(req,res){
  res.clearCookie("access-token");
  res.redirect("/");
});

router.get("/admin-console", auth, async (req, res)=>{

  res.render("adminConsole");
})

router.get("/admin-console/user", auth, async (req, res)=>{

  try{
    let sqlUser = 'SELECT * FROM users WHERE id = ?';
    const user = await query(sqlUser, req.user.id);
    var foundUser = user.map(v => Object.assign({}, v));
    foundUser = foundUser[0];
  }catch(e){
    console.log(e);
    next(err);
  }

  res.render("user", {userInfo:foundUser});
})

router.get("/admin-console/pages", auth, async (req, res)=>{

  try{
    let sqlUser = 'SELECT * FROM users WHERE id = ?';
    const user = await query(sqlUser, req.user.id);
    var foundUser = user.map(v => Object.assign({}, v));
    foundUser = foundUser[0];
  }catch(e){
    console.log(e);
    next(err);
  }

  try{
    let sqlShowIds = 'SELECT showId FROM usersShows WHERE userId = ?';
    const showIds = await query(sqlShowIds, req.user.id);
    var foundIds = showIds.map(v => Object.assign({}, v));
    console.log("Gli id sono: ", foundIds);
  }catch(e){
    console.log(e);
    next(err);
  }

  var ids = [];
  foundIds.forEach(function(foundId){
    ids.push(foundId.showId);
  });
  console.log("Il nuovo array ids è: ", ids.toString());

  try{
    let sqlShows = 'SELECT * FROM shows WHERE id IN ('+ids.toString()+')';
    const shows = await query(sqlShows);
    console.log(shows);
    var foundShows = shows.map(v => Object.assign({}, v));
    console.log("Gli shows sono: ", foundShows);
  }catch(e){
    console.log(e);
    next(err);
  }


  res.render("pages", {userInfo:foundUser, pagesInfo: foundShows});
})

router.get("/admin-console/pages/create", function(req,res){
  res.render("createPage");
});

router.get("/admin-console/posts", auth, async (req, res)=>{

  try{
    let sqlUser = 'SELECT * FROM users WHERE id = ?';
    const user = await query(sqlUser, req.user.id);
    var foundUser = user.map(v => Object.assign({}, v));
    foundUser = foundUser[0];
  }catch(e){
    console.log(e);
    next(err);
  }

  try{
    let sqlShowIds = 'SELECT showId FROM usersShows WHERE userId = ?';
    const showIds = await query(sqlShowIds, req.user.id);
    var foundIds = showIds.map(v => Object.assign({}, v));
    console.log("Gli id sono: ", foundIds);
  }catch(e){
    console.log(e);
    next(err);
  }

  var ids = [];
  foundIds.forEach(function(foundId){
    ids.push(foundId.showId);
  });
  console.log("Il nuovo array ids è: ", ids.toString());

  try{
    let sqlShows = 'SELECT * FROM shows WHERE id IN ('+ids.toString()+')';
    const shows = await query(sqlShows);
    console.log(shows);
    var foundShows = shows.map(v => Object.assign({}, v));
    console.log("Gli shows sono: ", foundShows);
  }catch(e){
    console.log(e);
    next(err);
  }


  res.render("pages", {userInfo:foundUser, pagesInfo: foundShows});
})

router.get("/admin-console/posts/create", auth, async function(req,res){
  res.render("compose");
});

router.post("/admin-console/posts/create", auth, async function(req,res){
  console.log(req.files);

  try {
        if(!req.body.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            let data = [];

            //loop all files
            _.forEach(_.keysIn(req.files.files), (key) => {
                let photo = req.files.photos[key];

                //move photo to uploads directory
                photo.mv('/images/posts' + photo.name);

                //push file details
                data.push({
                    name: photo.name,
                    mimetype: photo.mimetype,
                    size: photo.size
                });
            });

            //return response
            res.send({
                status: true,
                message: 'Files are uploaded',
                data: data
            });
        }
    } catch (err) {
        res.status(500).send(err);
    }

  res.render("compose");
});

module.exports = router;
