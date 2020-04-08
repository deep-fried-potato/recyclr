const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
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
    password: hashedPassword,
    userType:'customer'
  })
  user.save((err,newUser)=>{
    if(err) res.status(409).send({message:"Account Already Exists"})
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
      res.send({user:newUser,"token":token}})
    }
  })
})


router.post("/userLogin",(req,res)=>{
  users.findOne({email:req.body.email,loginType:'local'},(err,user)=>{
    if(err) res.status(500).send({message:"Internal Server Error"})
    else if(user == null) res.status(404).send({message:"No account with given credentials exists"})
    else{
      if(bcrypt.compareSync(req.body.password,user.password)){
        var token = jwt.sign({ id: user._id }, config.secret, { expiresIn: 86400 });
        res.send({user:user,"token":token})
      }
      else res.status(403).send({message:"Wrong Password"})
    }
  })
})

router.post("/googlesignin",(req,res)=>{
  axios.get('https://oauth2.googleapis.com/tokeninfo',{
    params:{
      id_token:req.body.idtoken
    }
  }).then((response)=>{
    console.log(response.data);
    userData = {
      name:response.data.name,
      email:response.data.email,
      _emailVerified:true,
      userType:'customer',
      loginType:'google'
    };
    users.findOneAndUpdate({
      email:response.data.email
    },
    {
      $setOnInsert:userData
    },
    {
      upsert: true,
      new: true,
      runValidators: true
    }).then((user)=>{
      var token = jwt.sign({ id: user._id }, config.secret, { expiresIn: 86400 });
      res.send({user:user,"token":token})
    }).catch((err)=>{
      console.log(err)
      res.status(400).send({message:"Invalid values provides"})
    })

  }).catch((err)=>{
    res.status(400).send({message:"Invalid Token Provided"})
    console.log(err)
  })
})

router.get("/verifyUserEmail/:id",(req,res)=>{
  users.findByIdAndUpdate(req.params.id,{_emailVerified:true}).then((user)=>{
    if(user) res.sendFile(path.join(__dirname+'/../html/verified.html'));
    else res.status(404).send({message:"Account Not Found"})
  }).catch((err)=>{
    console.log(err)
    res.status(500).send({message:"DB error"})
  })
})



router.post("/testcleanup",(req,res)=>{
  users.findOneAndDelete({email:"test@test.com"},(err,user)=>{
    if(err) res.status(500).send({message:"Internal Server Error"})
    else res.send("Deleted")
  })
})



module.exports = router
