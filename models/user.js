var mongoose = require('mongoose');
  var Schema = mongoose.Schema;

  var userSchema = new Schema({
    name: String,
    email: {
      type:String,
      required: true,
      unique: true
    },
    _emailVerified : {
      type: Boolean,
      default: false
    },
    password: String,
    phone: Number,
    _phoneVerified : {
      type: Boolean,
      default: false
    },
    photo: String,
    address: String,
    location:{
      lat: Number,
      lng: Number
    },
    userType:{
      type:String,
      required:true,
      enum:['customer','delivery','shop']
    }
  });
module.exports = mongoose.model('user',userSchema)
