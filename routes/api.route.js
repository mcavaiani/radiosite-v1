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

module.exports = router;
