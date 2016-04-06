
// Load required packages
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    userId: { type: String },
    pushToken: String,
    notification: Boolean,
    notification_type: String
  });

  module.exports = mongoose.model('User', userSchema);