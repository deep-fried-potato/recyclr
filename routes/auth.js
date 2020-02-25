const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const config = require('../config/secret');
var mailer = require('../helpers/mailer')
var users = require('../models/user');

var router = express.Router()

router.post("/registerUser",(req,res)=>{
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  var user = new users({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  })
  user.save((err,newUser)=>{
    if(err) res.status(409).send(err)
    else{
      var token = jwt.sign({ id: newUser._id}, config.secret, {expiresIn: 86400});
      var mailOptions = {
        from: 'citra.app.mailer@gmail.com',
        to: newUser.email,
        subject: 'Email verification',
        text: 'Your verification link is http://localhost:3000/auth/verifyUserEmail/' + newUser._id
      };
      mailer.sendMail(mailOptions, function(error, info){
        if (error) console.log(error);
        else console.log('Email sent: ' + info.response);
      });
      res.send([newUser,{"token":token}])
    }
  })
})


router.post("/userLogin",(req,res)=>{
  users.findOne({email:req.body.email},(err,user)=>{
    if(err) res.status(500).send("There has been an error")
    else if(user == null) res.status(404).send("No account with given credentials exists")
    else{
      if(bcrypt.compareSync(req.body.password,user.password)){
        var token = jwt.sign({ id: user._id }, config.secret, { expiresIn: 86400 });
        res.send({"token":token})
      }
      else res.status(403).send("Auth Error")
    }
  })
})

router.get("/verifyUserEmail/:id",(req,res)=>{
  users.findByIdAndUpdate(req.params.id,{_emailVerified:true}).then((user)=>{
    if(user) res.sendFile(path.join(__dirname+'/../html/verified.html'));
    else res.status(404).send("Account Not Found")
  }).catch((err)=>{
    console.log(err)
    res.status(500).send("DB error")
  })
})

module.exports = router
