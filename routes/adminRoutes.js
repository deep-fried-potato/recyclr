const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const config = require('../config/secret');
var mailer = require('../helpers/mailer')
var token2id = require('../helpers/token2id')
var users = require('../models/user');

var parts = require('../models/part');
var devices = require('../models/device');
var router = express.Router()

router.post("/createAdmin",adminValidate,(req,res)=>{
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  var admin = new users({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    photo:req.body.photo,
    loginType:'local',
    userType:'admin'
  })
  admin.save((err,newAdmin)=>{
    if(err) res.status(409).send({message:"Conflict error, user with same email exists"})
    else{
      var token = jwt.sign({ id: newAdmin._id}, config.secret, {expiresIn: 86400});
      var mailOptions = {
        from: 'citra.app.mailer@gmail.com',
        to: newAdmin.email,
        subject: 'You are now an Admin',
        text: 'You are now an admin at Recyclr. Please Use this email ID to log in. Password will be shared to you.'
      };
      mailer.sendMail(mailOptions, function(error, info){
        if (error) console.log(error);
        else console.log('Email sent: ' + info.response);
      });
      res.send({user:newAdmin,"token":token})
    }
  })
})


router.post("/partner",adminValidate,(req,res)=>{
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  var user = new users({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    photo:req.body.photo,
    _emailVerified:true,
    phone:req.body.phone,
    _phoneVerified:true,
    address:req.body.address,
    location:req.body.location,
    userType:'partner'
  })
  user.save((err,newUser)=>{
    if(err) res.status(409).send({message:"Account Already Exists"})
    else{
      var token = jwt.sign({ id: newUser._id}, config.secret, {expiresIn: 86400});
      var mailOptions = {
        from: 'citra.app.mailer@gmail.com',
        to: newUser.email,
        subject: 'Partnered With Recyclr',
        text: 'Congratulations, You are now a partner with Recyclr, Please use this email to login. Password will be given to you.'
      };
      mailer.sendMail(mailOptions, function(error, info){
        if (error) console.log(error);
        else console.log('Email sent: ' + info.response);
      });
      res.send({user:newUser,"token":token})
    }
  })
})

router.get("/user",adminValidate,(req,res)=>{
  users.find(req.query).then((result)=>{
    res.send(result)
  }).catch((err)=>{
    console.log(err)
    res.status(400).send({message:"Invalid Query"})
  })
})
router.put("/user/:id",adminValidate,(req,res)=>{
  users.findByIdAndUpdate(req.params.id,req.body,{new:true}).then((result)=>{
    res.send(result)
  }).catch((err)=>{
    console.log(err)
    res.status(400).send({message:"Invalid Query"})
  })
})
router.delete("/user/:id",adminValidate,(req,res)=>{
  users.findByIdAndRemove(req.params.id).then((result)=>{
    res.send(result)
  }).catch((err)=>{
    console.log(err)
    res.status(400).send({message:"Invalid Query"})
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
module.exports = router
