const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const config = require('../config/secret');
const querystring = require('querystring');
var mailer = require('../helpers/mailer')
var token2id = require('../helpers/token2id')
var users = require('../models/user');

var parts = require('../models/part');
var devices = require('../models/device');
var router = express.Router()


router.post("/part",adminValidate,(req,res)=>{
  newPart = req.body
  //ADD INVENTORY HIDING HERE!!!!
  parts.create(newPart).then((result)=>{
    res.send(result)
  }).catch((err)=>{
    res.status(400).send({message:"Invalid/Missing Details"})
  })
})

router.get("/part",userValidate,(req,res)=>{
  parts.find(req.query).then((result)=>{
    res.send(result)
  }).catch((err)=>{
    console.log(err)
    res.status(400).send({message:"Invalid Query"})
  })
})

router.get("/device",userValidate,(req,res)=>{
  devices.find(req.query).populate("parts").then((result)=>{
    res.send(result)
  }).catch((err)=>{
    console.log(err)
    res.status(400).send({message:"Invalid Query"})
  })
})

router.post("/device",adminValidate,(req,res)=>{
  newDevice = req.body
  devices.create(newDevice).then((result)=>{
    res.send(result)
  }).catch((err)=>{
    res.status(400).send({message:"Invalid/Missing Details"})
  })
})


function adminValidate(req,res,next){
  token2id(req.get("x-access-token")).then((id)=>{
    users.findById(id).then((admin)=>{
      if(admin.userType=='admin'){
        req.body.adminId = id;
        next();
      }
      else res.status(403).send({message:"user is not an admin"})
    })
  }).catch((err)=>{
    res.status(403).send({message:"Token Error"})
  })
}

function userValidate(req,res,next){
  token2id(req.get("x-access-token")).then((id)=>{
    users.findById(id).then((admin)=>{
        req.body.userId = id;
        next();
    })
  }).catch((err)=>{
    res.status(403).send({message:"Token Error"})
  })
}
module.exports = router
