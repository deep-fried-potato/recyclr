var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId
var deviceSchema = new Schema({
  name: String,
  photo:String,
  description:String,
  manufacturer:String,
  parts:[{
    type:ObjectId,
    ref:'part'
  }]
});
module.exports = mongoose.model('device',deviceSchema)
