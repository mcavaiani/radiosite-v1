const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  date: String,
  program: String,
  previewPicture: String
});

const Post = new mongoose.model('Post',postSchema);

exports.Post = Post;
