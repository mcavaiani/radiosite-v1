const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  name: String,
  description: String,
  author: String,
  stateName: String
});

const Blog = new mongoose.model('Blog',blogSchema);

exports.Blog = Blog;
