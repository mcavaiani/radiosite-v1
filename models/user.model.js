const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // email: String,
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255
  },
  name: String,
  lastName: String,
  nickName: String,
  description: String,
  pictureUrl: String,
  facebook: String,
  instragram: String,
  twitter: String,
  tiktok: String,
  isAdmin: Boolean
});

//custom method to generate authToken
userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id, username: this.username, isAdmin: this.isAdmin }, process.env.SECRETKEY); //get the private key from the config file -> environment variable
  return token;
}

const User = new mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = {
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(3).max(255).required()
  };

  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
