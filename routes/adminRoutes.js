const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const config = require('../config/secret');
var mailer = require('../helpers/mailer')
var token2id = require('../helpers/token2id')
var users = require('../models/user');
var admins = require('../models/admin');
var parts = require('../models/part');
var devices = require('../models/device');
var router = express.Router()

router.post("/createAdmin",adminValidate,(req,res)=>{
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  var admin = new admins({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  })
  admin.save((err,newAdmin)=>{
    if(err) res.status(409).send({message:"Conflict error, admin with same email exists"})
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
      res.send([newAdmin,{"token":token}])
    }
  })
})

router.post("/login",(req,res)=>{
  admins.findOne({email:req.body.email},(err,user)=>{
    if(err) res.status(500).send({message:"Internal Server Error"})
    else if(user == null) res.status(404).send({message:"No account with given credentials exists"})
    else{
      if(bcrypt.compareSync(req.body.password,user.password)){
        var token = jwt.sign({ id: user._id }, config.secret, { expiresIn: 86400 });
        res.send({"token":token})
      }
      else res.status(403).send({message:"Wrong password"})
    }
  })
})

router.post("/initializeAdmin",(req,res)=>{
  admins.find().then((result)=>{
    if(result.length>0){
      console.log(result)
      res.status(403).send({message:"Admin Already Exists"})
    }
    else{
      console.log("NO ADMIN")
      var hashedPassword = bcrypt.hashSync(req.body.password, 8);
      var admin = new admins({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      })
      admin.save((err,newAdmin)=>{
        if(err) res.status(409).send({message:"Admin Already exists"})
        else{
          var token = jwt.sign({ id: newAdmin._id}, config.secret, {expiresIn: 86400});
          var mailOptions = {
            from: 'citra.app.mailer@gmail.com',
            to: newAdmin.email,
            subject: 'You are now an Admin',
            text: 'You are now an admin at Recyclr. Please Use this email ID to log in.'
          };
          mailer.sendMail(mailOptions, function(error, info){
            if (error) console.log(error);
            else console.log('Email sent: ' + info.response);
          });
          res.send([newAdmin,{"token":token}])
        }
      })
    }
  }).catch((err)=>{
    console.log(err)
    res.send()
  })
})

router.post("/partner",adminValidate,(req,res)=>{
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  var user = new users({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
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
      res.send([newUser,{"token":token}])
    }
  })
})

router.post("/part",adminValidate,(req,res)=>{
  newPart = req.body
  //ADD INVENTORY HIDING HERE!!!!
  parts.create(newPart).then((result)=>{
    res.send(result)
  }).catch((err)=>{
    res.status(400).send({message:"Invalid/Missing Details"})
  })
})

router.get("/part",adminValidate,(req,res)=>{
  parts.find({}).then((result)=>{
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
    admins.findById(id).then((admin)=>{
      req.body.adminId = id;
      next();
    })
  }).catch((err)=>{
    res.status(403).send({message:"Token Error"})
  })
}
module.exports = router
