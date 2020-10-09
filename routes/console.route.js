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
const multer = require('multer');
const dbModule = require('../db/dbModule');
const mysql = require('mysql');
const app = express();
app.use(express.static("public"));

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/posts');
  },
  filename: function (req, file, cb) {
    if (file.fieldname === "preview"){
      cb(null, "preview_" + Date.now() + "_" + file.originalname);
    }else if(file.fieldname === "pics"){
      cb(null, "post_" + Date.now() + "_" + file.originalname);
    }
  }
});

var upload = multer({ storage: fileStorage });

router.get("/register", function(req, res) {
  res.render("register");
});

router.post("/register", async (req, res) => {

  // validate the request body first
  const {
    error
  } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  var user = "";
  try{
    let sqlUser = 'SELECT * FROM users WHERE userName = ?';
    user = await dbModule.query(sqlUser, req.body.username);
  }catch(e){
    console.log(e);
    res.status(500).send();
  }

  console.log(user);
  if (user.length){
    return res.status(401).send({
      accessToken: null,
      message: "Utente già registrato!"
    });
  }

  const userPassword = await bcrypt.hash(req.body.password, 10);

  var newUser = "";
  try{
    let sqlNewUser = 'INSERT INTO users(username, password, isAdmin) VALUES ('+"'"+req.body.username+"'"+","+"'"+userPassword+"'"+"'"+"0"+"'"+')';
    newUser = await dbModule.query(sqlNewUser, req.body.username);
    console.log(user);
  }catch(e){
    console.log(e);
    res.status(500).send();
  }

  // const token = user.generateAuthToken();
  // res.set("x-access-token", token);
  res.redirect("/");

});

router.get("/login", function(req, res) {

  //add check jwt before render login
  res.render("login");
});

router.post("/login", async (req, res) => {

  try{
    let sqlUser = 'SELECT * FROM users WHERE userName = ?';
    const user = await dbModule.query(sqlUser, req.body.username);
    var foundUser = user.map(v => Object.assign({}, v));
    foundUser = foundUser[0];
  }catch(e){
    console.log(e);
    next(err);
  }
  console.log("Found user");

  if (!foundUser){
    return res.status(401).send({
      accessToken: null,
      message: "Invalid username!"
    });
  }
  console.log("Username is valid");
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
  console.log("Password is valid");

  var token = jwt.sign({
    id: foundUser.id,
    username: foundUser.username,
    nickName: foundUser.nickName,
    isAdmin: foundUser.isAdmin
  }, process.env.SECRETKEY, {
    expiresIn: 3600 // 1 hour
  });
  if (process.env.NODE_ENV!=="localdev"){
    res.cookie("access-token", token, { httpOnly: true, secure: true});
  }else{
    res.cookie("access-token", token, { httpOnly: true, secure: false});
  }

  res.redirect("/console/admin-console/user");
});

router.get("/logout",function(req,res){
  res.clearCookie("access-token");
  res.redirect("/");
});

router.get("/admin-console", auth, async (req, res)=>{

  res.render("adminConsole");
});

router.get("/admin-console/user", auth, async (req, res)=>{

  try{
    let sqlUser = 'SELECT * FROM users WHERE id = ?';
    const user = await dbModule.query(sqlUser, req.user.id);
    var foundUser = user.map(v => Object.assign({}, v));
    foundUser = foundUser[0];
    console.log(foundUser);
  }catch(e){
    console.log(e);
    next(err);
  }

  res.render("user", {userInfo:foundUser});
});

router.get("/admin-console/pages", auth, async (req, res)=>{

  try{
    let sqlUser = 'SELECT * FROM users WHERE id = ?';
    const user = await dbModule.query(sqlUser, req.user.id);
    var foundUser = user.map(v => Object.assign({}, v));
    foundUser = foundUser[0];
  }catch(e){
    console.log(e);
    next(err);
  }

  var foundIds = [];
  try{
    let sqlShowIds = 'SELECT showId FROM usersShows WHERE userId = ?';
    const showIds = await dbModule.query(sqlShowIds, req.user.id);
    foundIds = showIds.map(v => Object.assign({}, v));
  }catch(e){
    console.log(e);
    next(err);
  }

  var foundShows=[];
  if (foundIds.length){
    var ids = [];
    foundIds.forEach(function(foundId){
      ids.push(foundId.showId);
    });

    try{
      let sqlShows = 'SELECT * FROM shows WHERE id IN ('+ids.toString()+')';
      const shows = await dbModule.query(sqlShows);
      foundShows = shows.map(v => Object.assign({}, v));
    }catch(e){
      console.log(e);
      next(err);
    }
  }

  res.render("pages", {userInfo:foundUser, pagesInfo: foundShows});
});

router.get("/admin-console/pages/create", auth, function(req,res){
  res.render("createPage");
});

router.get("/admin-console/:page/posts", auth, async (req, res)=>{

  var foundShow = "";
  try{
    let sqlShow = 'SELECT * FROM shows WHERE stateName = ?';
    const show = await dbModule.query(sqlShow, req.params.page);
    foundShow = show.map(v => Object.assign({}, v));
    foundShow = foundShow[0];
  }catch(e){
    console.log(e);
    next(err);
  }

  var foundPosts = "";
  try{
    let sqlPosts = 'SELECT * FROM posts WHERE author = ? and program = ?';
    const posts = await dbModule.query(sqlPosts, [req.user.nickName, req.params.page]);
    foundPosts = posts.map(v => Object.assign({}, v));
  }catch(e){
    console.log(e);
    next(err);
  }

  var isBlog = false;
  if(foundShow.type ==='blog'){
    isBlog = true;
  }

  res.render("userPosts", {page: foundShow, postsInfo: foundPosts});
});

router.get("/admin-console/:page/posts/:id", auth, async (req, res)=>{


  console.log("INIZIO API GET POST ID");
  console.log(req.params);
  var foundType = "";
  try{
    let sqlShow = 'SELECT type FROM shows WHERE stateName = ?';
    const showType = await dbModule.query(sqlShow, req.params.page);
    foundType = showType.map(v => Object.assign({}, v));
    foundType = foundType[0];
  }catch(e){
    console.log(e);
  res.redirect("/")
  }
  console.log(foundType);

  var foundPost = "";
  try{
    let sqlPost = 'SELECT * FROM posts WHERE id = ?';
    const post = await dbModule.query(sqlPost, req.params.id);
    foundPost = post.map(v => Object.assign({}, v));
    foundPost = foundPost[0];
  }catch(e){
    console.log(e);
    res.redirect("/")
  }
  console.log(foundPost);

  var foundImgs = "";
  try{
    let sqlImgs = 'SELECT * FROM postImages WHERE post = ? ';
    const imgs = await dbModule.query(sqlImgs, req.params.id);
    foundImgs = imgs.map(v => Object.assign({}, v));
  }catch(e){
    console.log(e);
    res.redirect("/")
  }
  console.log(foundImgs)

  console.log("END API")
  res.render("editPost", {post: foundPost, images: foundImgs, pageType: foundType.type.toString()});
});

router.post("/admin-console/:page/posts/:id", auth, upload.fields([{name: 'preview'}, {name: 'pics'}]), async (req, res)=>{

  console.log("INIZIO API POST ID");
  console.log(req.params.id);
  var foundPost = "";
  try{
    let sqlPost = 'SELECT * FROM posts WHERE id = ?';
    newPost = await dbModule.query(sqlPost, req.params.id);
    var foundPost = newPost.map(v => Object.assign({}, v));
    foundPost = foundPost[0];
  }catch(e){
    console.log(e);
    res.status(500).send("Qualcosa è andato storto");
  }
  console.log(foundPost);

  var updatePost = foundPost;
  if(req.body.postTitle){updatePost.title = req.body.postTitle};
  if(req.body.postContent){updatePost.content = req.body.postContent};
  if(req.body.postPreview){updatePost.preview = req.body.postPreview};
  if(req.files.preview[0].filename){updatePost.previewPicture = "../images/posts/" + req.files.preview[0].filename};

  try{
    let sqlUpdatePost = 'UPDATE posts SET title = ?, content = ?, previewPicture = ?, preview = ? WHERE id = ?';
    updatedPost = await dbModule.query(sqlUpdatePost,[updatePost.title, updatePost.content, updatePost.previewPicture, updatePost.preview, updatePost.id]);
  }catch(e){
    console.log(e);
    res.status(500).send("Qualcosa è andato storto");
  }

  if(req.files.pics){
    try{
      let sqlPostImgs = "DELETE FROM postImages WHERE post = ?";
      const imgsDel = await dbModule.query(sqlPostImgs, req.params.id);
      console.log(imgsDel.affectedRows + " record(s) updated");
    }catch(e){
      console.log(e);
      res.status(500).send("Qualcosa è andato storto");
    }
    // INSERT A DB

    req.files.pics.forEach(async function(pic){

      try{
        var pathImg = "../images/posts/" + pic.filename;
        let sqlPostImage = 'INSERT INTO postImages(post, imgPath) VALUES ('+"'"+ req.params.id+"'"+','+ "'"+pathImg+"'"+ ')';
        postImage = await dbModule.query(sqlPostImage);
      }catch(e){
        console.log(e);
        next(e);
        res.status(500).send("Qualcosa è andato storto");
      }

      });
  }

  res.redirect("../../pages");

});

router.delete("/admin-console/:page/posts/:id", auth, async (req, res)=>{

  try{
    let sqlImg = 'DELETE FROM postImages WHERE post = ?';
    const imgsDeleted = await dbModule.query(sqlImg, req.params.id);
    console.log(imgsDeleted.affectedRows + " record(s) updated");
  }catch(e){
    console.log(e);
    next(err);
  }

  try{
    let sqlPost = 'DELETE FROM posts WHERE id = ?';
    const postDeleted = await dbModule.query(sqlPost, req.params.id);
    console.log(postDeleted.affectedRows + " record(s) updated");
  }catch(e){
    console.log(e);
    next(err);
  }

  res.status(200).send("OK");

});

router.get("/admin-console/posts/create", auth, async function(req,res){

  var foundShowsId = [];
  try{
    let sqlShowsId = 'SELECT showId FROM usersShows WHERE userId = ?';
    const showsId = await dbModule.query(sqlShowsId, req.user.id);
    foundShowsId = showsId.map(v => Object.assign({}, v));
  }catch(e){
    console.log(e);
    next(err);
  }
  var foundShows = [];
  if(foundShowsId.length){

    var idList = [];
    foundShowsId.forEach(function(show){
      idList.push(show.showId);
    });

    try{
      let sqlShows = 'SELECT * FROM shows WHERE id IN ('+idList.toString()+')';
      const shows = await dbModule.query(sqlShows);
      foundShows = shows.map(v => Object.assign({}, v));
    }catch(e){
      console.log(e);
      next(err);
    }

  }

  res.render("compose-new", {showList: foundShows});
});

router.post("/admin-console/posts/create", auth, upload.fields([{name: 'preview'}, {name: 'pics'}]), async function(req,res){

  var newPost = "";
  try{
    var dateString = new Date().toISOString();
    var pathImg = "../images/posts/" + req.files.preview[0].filename;
    let sqlNewPost = 'INSERT INTO posts(title, content, author, postDate, program, previewPicture, preview) VALUES (?,?,?,?,?,?,?)';
    newPost = await dbModule.query(sqlNewPost,[req.body.postTitle,req.body.postContent,req.user.nickName,dateString,req.body.programName,pathImg,req.body.postPreview]);
  }catch(e){
    console.log(e);
    res.status(500).send("Qualcosa è andato storto");
  }

  newPostId = newPost.insertId;

  if (req.files.pics){
  req.files.pics.forEach(async function(pic){

    try{

      var pathImg = "../images/posts/" + pic.filename;
      let sqlPostImage = 'INSERT INTO postImages(post, imgPath) VALUES ('+"'"+ newPostId+"'"+','+ "'"+pathImg+"'"+ ')';
      postImage = await dbModule.query(sqlPostImage);
    }catch(e){
      console.log(e);
      next(e);
      res.status(500).send("Qualcosa è andato storto");
    }


  });
  }

  try{
    let sqlShowsId = 'SELECT showId FROM usersShows WHERE userId = ?';
    const showsId = await dbModule.query(sqlShowsId, req.user.id);
    var foundShowsId = showsId.map(v => Object.assign({}, v));
  }catch(e){
    console.log(e);
    next(e);
  }

  var idList = [];
  foundShowsId.forEach(function(show){
    idList.push(show.showId);
  });

  try{
    let sqlShows = 'SELECT * FROM shows WHERE id IN ('+idList.toString()+')';
    const shows = await dbModule.query(sqlShows);
    var foundShows = shows.map(v => Object.assign({}, v));
  }catch(e){
    console.log(e);
    next(e);
  }


  res.render("compose-new", {showList: foundShows});

});

module.exports = router;
