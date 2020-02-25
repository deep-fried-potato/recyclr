const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const config = require('../config/secret');
var mailer = require('../helpers/mailer')
var users = require('../models/user');
var admins = require('../models/admin')

var router = express.Router()

router.post("/createAdmin",superUserValidate,(req,res)=>{
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  var admin = new admins({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  })
  admin.save((err,newAdmin)=>{
    if(err) res.status(409).send(err)
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


function adminValidate(req,res,next){
  token2id(req.get("x-access-token")).then((id)=>{
    admins.findById(id).then((admin)=>{
      req.body.adminId = id;
      next();
    })
  }).catch((err)=>{
    res.status(403).send("Token Error")
  })
}

function superUserValidate(req,res,next){
  token2id(req.get("x-access-token")).then((id)=>{
    admins.findById(id).then((admin)=>{
      if(admin._isSuperUser==true){
        req.body.adminId = id;
        next();
      }
      else res.status(403).send("Not SuperUser")

    })
  }).catch((err)=>{
    res.status(403).send("Token Error")
  })
}
module.exports = router
