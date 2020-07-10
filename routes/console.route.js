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
  res.redirect("/console/adminConsole");

});

router.get("/login", function(req, res) {
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

  };
  var token = jwt.sign({
    id: user.id
  }, process.env.SECRETKEY, {
    expiresIn: 3600 // 24 hours
  });
  res.cookie("access-token", token, { httpOnly: true, secure: false});
  res.redirect("/console/adminConsole");
});

router.get("/logout",function(req,res){
  res.clearCookie("access-token");
  res.redirect("/");
});


router.get("/adminConsole", auth, async (req, res)=>{
  // passport.authenticate("local");
  res.render("adminConsole");
})



//
//
// router.get("/current", auth, async (req, res) => {
//   const user = await User.findById(req.user._id).select("-password");
//   res.send(user);
// });

module.exports = router;
