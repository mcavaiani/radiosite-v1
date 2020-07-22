const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  name: String,
  description: String,
  author: String,
  stateName: String
});

const Show = new mongoose.model('Show',showSchema);

exports.Show = Show;
