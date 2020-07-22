const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const { User, validate } = require("../models/user.model");
const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');

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

  let user = await User.findOne({
    username: req.body.username
  });

  if (!user){
    return res.status(401).send({
      accessToken: null,
      message: "Invalid username!"
    });
  }
  var passwordIsValid = bcrypt.compareSync(
    req.body.password,
    user.password
  );

  if (!passwordIsValid) {
    return res.status(401).send({
      accessToken: null,
      message: "Invalid password!"
    });
  };
  var token = jwt.sign({
    id: user.id
  }, process.env.SECRETKEY, {
    expiresIn: 3600 // 1 hour
  });
  res.cookie("access-token", token, { httpOnly: true, secure: false});
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

  let user = await User.findOne({
    _id: req.user.id
  });

  res.render("user", {userInfo:user});
})





//
//
// router.get("/current", auth, async (req, res) => {
//   const user = await User.findById(req.user._id).select("-password");
//   res.send(user);
// });

module.exports = router;
