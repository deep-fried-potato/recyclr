const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
var request= require('request');
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
var router = express.Router()

router.get('/order',userValidate,(req,res)=>{
  order.find({buyer:req.body.userId}).then((orders)=>{
    res.send(orders)
  }).catch((err)=>{
    console.log(err)
    res.status(400).send({message:"Invalid Query"})
  })
})

router.post('/order',userValidate,(req,res)=>{

  var neworder = new order({
    buyer: req.body.userId,
    items:[],
    amount:0,
    status:'processing'
  })
  users.findByIdAndUpdate(req.body.userId,{$set:{cart:[]},cartValue:0}).populate('cart').then((result)=>{
      neworder.items = result.cart.map(a => a.part)
      neworder.amount = result.cartValue
      if(neworder.amount==0){
        res.status(400).send({message:"cart value cant be zero"})
      }
      else{
        neworder.save()
        console.log("Calling payment API")
        var headers = { 'X-Api-Key': 'test_9506a69f44e1feb678d6275bc97', 'X-Auth-Token': 'test_00efe9868932c51b6ca50f8e7e3'}
        var payload = {
          purpose: neworder._id.toString(),
          amount: neworder.amount,
          phone: '9999999999',
          buyer_name: result.name,
          redirect_url: 'http://test.instamojo.com',
          send_email: true,
          webhook: 'http://b207d4d0a946.ngrok.io/payment/confirmPayment',
          send_sms: false,
          email: result.email,
          allow_repeated_payments: false}

        request.post('https://test.instamojo.com/api/1.1/payment-requests/', {form: payload,  headers: headers}, function(error, response, body){
          if(!error && response.statusCode == 201) res.send(body);
          else res.status(400).send(error)
        })
      }
  }).catch((err)=>{
    console.log(err)
    res.status(400).send({message:"Invalid Query"})
  })

})

router.post("/confirmPayment",(req,res)=>{
  console.log("CALLBACK!!")
  if(paymentValidator(req.body)){
    order.findByIdAndUpdate(req.body.purpose,{status:"Confirmed",paymentId:req.body.payment_id}).then((update)=>{
      res.send({})
    }).catch((err)=>{
      console.log(err)
      res.status(500).send()
    })
  }
  else res.status(403).send()
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
    users.findById(id).then((user)=>{
        req.body.userId = id;
        next();
    })
  }).catch((err)=>{
    res.status(403).send({message:"Token Error"})
  })
}
module.exports = router
