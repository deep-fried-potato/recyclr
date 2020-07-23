var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId

var purchaseSchema = new Schema({
    seller:{
        type:ObjectId,
        ref:'user'
    },
    shop:{
        type:ObjectId,
        ref:'user'
    },
    item:{
        type:ObjectId,
        ref:'device'
    },
    date:{
        type:Date,
        default:Date.now()
    },
    amount:{
        type:Number,
        required:true
    },
    partsWorking:[{
        type:ObjectId,
        ref:'part'
    }],
    status:{
        type:String,
    }
})

module.exports = mongoose.model('purchase',purchaseSchema)
