const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const mixSchema = new mongoose.Schema({
  name: String,
  description: String,
  author: String,
  stateName: String
});


const Mix = new mongoose.model('Mix',mixSchema);

exports.Mix = Mix;
