// const jwt = require("jsonwebtoken");
// const config = require("config");
//
// module.exports = function(req, res, next) {
//   //get the token from the header if present
//   const token = req.cookies['access-token'] || req.headers["x-access-token"] || req.headers["authorization"];
//   //if no token found, return response (without going to the next middelware)
//   console.log(req);
//   if (!token) return res.status(401).send("Access denied. No token provided.");
//
//   try {
//     //if can verify the token, set req.user and pass to next middleware
//     const decoded = jwt.verify(token, process.env.SECRETKEY);
//     req.user = decoded;
//     console.log("JWT info: ",req.user);
//     next();
//   } catch (ex) {
//     //if invalid token
//     res.status(403).send("Invalid token.");
//   }
// };
//
// userSchema.methods.generateAuthToken = function() {
//   const token = jwt.sign({ _id: this._id, username: this.username, isAdmin: this.isAdmin }, process.env.SECRETKEY); //get the private key from the config file -> environment variable
//   return token;
// }
