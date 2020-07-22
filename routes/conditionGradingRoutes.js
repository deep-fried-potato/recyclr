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


router.post('/estimate',estimate)


function estimate(req,res,next){

    estimation = 0;
    p = req.body.partsWorking
    for (i = 0 ; i < req.body.partsWorking.length; i++){

        parts.findById(p[i]).then((result)=>{
            estimation = estimation + result.price
            console.log(i)      
        }).catch((err)=>{
            res.status(400).send({message:"Estimate na hopaya"})
          })
    }

    setTimeout(() => { res.send({'estimate':estimation*1.1})}, 1000);
}

module.exports = router