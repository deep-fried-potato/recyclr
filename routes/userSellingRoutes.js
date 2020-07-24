const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const config = require('../config/secret');
const querystring = require('querystring');
var mailer = require('../helpers/mailer')
var token2id = require('../helpers/token2id')
var paymentValidator = require('../helpers/paymentValidator')
var users = require('../models/user');

var parts = require('../models/part');
var devices = require('../models/device');
var purchase = require('../models/purchase');
var order = require('../models/order');
const part = require('../models/part');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');
const { waitForDebugger } = require('inspector');

var router = express.Router()


router.post("/estimate",userValidate,(req,res)=>{
  partsList  = req.body.partsWorking
  res.send({'estimate':estimate(partsList)})
})

router.post("/userSale",userValidate,(req,res)=>{
  purchase.create({
    seller:req.body.userId,
    item:req.body.device,
    amount:estimate(req.body.partsWorking),
    partsWorking:req.body.partsWorking.map(a=> a._id),
    status:"processing"
  }).then((result)=>{
    res.status(201).send(result)
  }).catch((err)=>{
    console.log(err)
    res.send(400).send({message:"Invalid"})
  })
})

router.get("/userSale",userValidate,(req,res)=>{
  purchase.find(req.query).populate('seller partsWorking item shop').then((purchases)=>{
    res.send(purchases)
  }).catch((err)=>{
    console.log(err)
    res.send(400).send({message:"Invalid"})
  })
})

router.post("/acceptUserSale",partnerValidate,(req,res)=>{
  purchase.findByIdAndUpdate(req.body.purchaseId,{status:"Accepted"},{new:true}).then((updated)=>{
    res.send(updated)
  }).catch((err)=>{
    console.log(err)
    res.send(400).send({message:"Invalid"})
  })
})

router.post("/rejectUserSale",partnerValidate,(req,res)=>{
  purchase.findByIdAndUpdate(req.body.purchaseId,{status:"Rejected"},{new:true}).then((updated)=>{
    res.send(updated)
  }).catch((err)=>{
    console.log(err)
    res.send(400).send({message:"Invalid"})
  })
})

router.post("/claimUserSale",partnerValidate,(req,res)=>{
  purchase.findByIdAndUpdate(req.body.purchaseId,{shop:req.body.userId},{new:true}).then((updated)=>{
    res.send(updated)
  }).catch((err)=>{
    console.log(err)
    res.send(400).send({message:"Invalid"})
  })
})

router.post("/unclaimUserSale",partnerValidate,(req,res)=>{
  purchase.findByIdAndUpdate(req.body.purchaseId,{shop:null},{new:true}).then((updated)=>{
    res.send(updated)
  }).catch((err)=>{
    console.log(err)
    res.send(400).send({message:"Invalid"})
  })
})

function estimate(partsList){
  var total = 0
  for (i = 0 ; i < partsList.length; i++){
    total = total + partsList[i].price
  }
  total = total*1.2
  return Math.round(total)
}

function userValidate(req,res,next){
  token2id(req.get("x-access-token")).then((id)=>{
    users.findById(id).then((user)=>{
        req.body.userId = id;
        next();
    })
  }).catch((err)=>{
    res.status(403).send({message:"Token Error"})
  })
}
function partnerValidate(req,res,next){
  token2id(req.get("x-access-token")).then((id)=>{
    users.findById(id).then((partner)=>{
      if(partner.userType=='partner'){
        req.body.userId = id;
        next();
      }
      else res.status(403).send({message:"user is not a partner"})
    })
  }).catch((err)=>{
    res.status(403).send({message:"Token Error"})
  })
}
module.exports = router
