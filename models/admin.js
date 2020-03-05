var mongoose = require('mongoose');
  var Schema = mongoose.Schema;

  var adminSchema = new Schema({
    name: String,
    email: {
      type:String,
      required: true,
      unique: true
    },
    password: String
  });
module.exports = mongoose.model('admin',adminSchema)
