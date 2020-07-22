var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId

var orderSchema = new Schema({
    buyer:{
        type:ObjectId,
        ref:'user'
    },
    shop:{
        type:ObjectId,
        ref:'user'
    },
    items:[{
        type:ObjectId,
        ref:'part'
    }],
    date:{
        type:Date,
        default:Date.now()
    },
    amount:{
        type:Number,
        required:true
    },
    status:{
        type:String,
    }
})

module.exports = mongoose.model('order',orderSchema)
