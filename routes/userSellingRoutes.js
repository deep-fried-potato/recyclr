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
  estimate = 0
  for (i = 0 ; i < partsList.length; i++){
    estimate = estimate + partsList[i].price
  }
  estimate = estimate*1.2
  res.send({'estimate':estimate})
})

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
module.exports = router
