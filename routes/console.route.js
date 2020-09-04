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

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => { // setting destination of uploading files
//     if (file.fieldname === "resume") { // if uploading resume
//       cb(null, 'resumes');
//     } else { // else uploading image
//       cb(null, 'images');
//     }
//   },
//   filename: (req, file, cb) => { // naming file
//     cb(null, file.fieldname+"-"+uuidv4()+path.extname(file.originalname));
//   }
// });
//
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
    nickName: foundUser.nickName,
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

router.get("/admin-console/:page/posts", auth, async (req, res)=>{

  // try{
  //   let sqlUser = 'SELECT * FROM users WHERE id = ?';
  //   const user = await query(sqlUser, req.user.id);
  //   var foundUser = user.map(v => Object.assign({}, v));
  //   foundUser = foundUser[0];
  // }catch(e){
  //   console.log(e);
  //   next(err);
  // }
  //
  // try{
  //   let sqlShowIds = 'SELECT showId FROM usersShows WHERE userId = ?';
  //   const showIds = await query(sqlShowIds, req.user.id);
  //   var foundIds = showIds.map(v => Object.assign({}, v));
  //   console.log("Gli id sono: ", foundIds);
  // }catch(e){
  //   console.log(e);
  //   next(err);
  // }
  //
  // var ids = [];
  // foundIds.forEach(function(foundId){
  //   ids.push(foundId.showId);
  // });
  // console.log("Il nuovo array ids è: ", ids.toString());
  //


  var foundShow = "";
  try{
    let sqlShow = 'SELECT * FROM shows WHERE stateName = ?';
    const show = await query(sqlShow, req.params.page);
    console.log(show);
    foundShow = show.map(v => Object.assign({}, v));
    foundShow = foundShow[0];
    console.log("Gli shows sono: ", foundShow);
  }catch(e){
    console.log(e);
    next(err);
  }

  var foundPosts = "";
  try{
    let sqlPosts = 'SELECT * FROM posts WHERE author = ? and program = ?';
    const posts = await query(sqlPosts, [req.user.nickName, req.params.page]);
    console.log(posts);
    foundPosts = posts.map(v => Object.assign({}, v));
    console.log("Gli shows sono: ", foundPosts);
  }catch(e){
    console.log(e);
    next(err);
  }




  res.render("userPosts", {page: foundShow, postsInfo: foundPosts});
})


router.get("/admin-console/:page/posts/:postId", auth, async (req, res)=>{

  var foundPost = "";
  try{
    let sqlPost = 'SELECT * FROM posts WHERE id = ?';
    const post = await query(sqlPost, req.params.postId);
    console.log(post);
    foundPost = post.map(v => Object.assign({}, v));
    foundPost = foundPost[0];
    console.log("Gli shows sono: ", foundPost);
  }catch(e){
    console.log(e);
    next(err);
  }

  res.render("editPost", {post: foundPost});
})


router.get("/admin-console/posts/create", auth, async function(req,res){

  try{
    let sqlShowsId = 'SELECT showId FROM usersShows WHERE userId = ?';
    const showsId = await query(sqlShowsId, req.user.id);
    console.log(showsId);
    var foundShowsId = showsId.map(v => Object.assign({}, v));
    console.log("Gli shows sono: ", foundShowsId);
  }catch(e){
    console.log(e);
    next(err);
  }

  var idList = [];
  foundShowsId.forEach(function(show){
    idList.push(show.showId);
  });

  try{
    let sqlShows = 'SELECT * FROM shows WHERE id IN ('+idList.toString()+')';
    const shows = await query(sqlShows);
    console.log(shows);
    var foundShows = shows.map(v => Object.assign({}, v));
    console.log("Gli shows sono: ", foundShows);
  }catch(e){
    console.log(e);
    next(err);
  }


  res.render("compose", {showList: foundShows});
});

router.post("/admin-console/posts/create", auth, upload.fields([{name: 'preview'}, {name: 'pics'}]), async function(req,res){

  console.log(req.body);
  console.log(req.files.preview);
  console.log(req.files.pics);

  var newPost = "";
  try{
    var dateString = new Date().toISOString();
    var pathImg = "../images/posts/" + req.files.preview[0].filename;
    let sqlNewPost = 'INSERT INTO posts(title, content, author, postDate, program, previewPicture) VALUES ('+"'"+ req.body.postTitle+"'"+','+ "'"+req.body.postContent+"'"+','+"'"+ req.user.nickName+"'"+','+"'"+ dateString +"'"+','+"'"+req.body.programName +"'"+','+"'"+ pathImg+"'" +')';
    console.log("INSERT per il nuovo programma: ", sqlNewPost);
    newPost = await query(sqlNewPost);
    console.log(newPost);
  }catch(e){
    console.log(e);
    next(err);
    res.status(500).send("Qualcosa è andato storto");
  }

  newPostId = newPost.insertId;

  req.files.pics.forEach(async function(pic){

    try{

      var pathImg = "../images/posts/" + pic.filename;
      let sqlPostImage = 'INSERT INTO postImages(post, imgPath) VALUES ('+"'"+ newPostId+"'"+','+ "'"+pathImg+"'"+ ')';
      console.log("INSERT per il nuovo programma: ", sqlPostImage);
      postImage = await query(sqlPostImage);
      console.log(postImage);
    }catch(e){
      console.log(e);
      next(err);
      res.status(500).send("Qualcosa è andato storto");
    }


  });

  try{
    let sqlShowsId = 'SELECT showId FROM usersShows WHERE userId = ?';
    const showsId = await query(sqlShowsId, req.user.id);
    console.log(showsId);
    var foundShowsId = showsId.map(v => Object.assign({}, v));
    console.log("Gli shows sono: ", foundShowsId);
  }catch(e){
    console.log(e);
    next(err);
  }

  var idList = [];
  foundShowsId.forEach(function(show){
    idList.push(show.showId);
  });

  try{
    let sqlShows = 'SELECT * FROM shows WHERE id IN ('+idList.toString()+')';
    const shows = await query(sqlShows);
    console.log(shows);
    var foundShows = shows.map(v => Object.assign({}, v));
    console.log("Gli shows sono: ", foundShows);
  }catch(e){
    console.log(e);
    next(err);
  }


  res.render("compose", {showList: foundShows});

});

module.exports = router;
