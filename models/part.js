var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId
var partSchema = new Schema({
  name: String,
  photo:String,
  partType:{
    type:String,
    required:true,
    enum:['display','battery','motherboard','camera','speaker','fingerprint','vibrator','charger']
  },
  description:String,
  variant:String,
  price:Number,
  availability:[{
    shop:{
      type:ObjectId,
      ref:'user'
    },
    quanitity:Number
  }]
});
module.exports = mongoose.model('part',partSchema)
