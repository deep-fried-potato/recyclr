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
var order = require('../models/order')
var router = express.Router()

router.get("/inventory",partnerValidate,(req,res)=>{
  users.findById(req.body.userId).populate('inventory.part').then((user)=>{
    res.send(user)
  }).catch((err)=>{
    console.log(err)
    res.status(500).send({message:"There has been an internal error"})
  })
})
router.post("/inventory",partnerValidate,(req,res)=>{
  users.findById(req.body.userId).then((user)=>{
    if(user.inventory.filter(item => item.part == req.body.partId).length != 0){
      users.findOneAndUpdate({_id:req.body.userId,"inventory.part":req.body.partId},{$inc:{"inventory.$.quantity":1}},{new:true}).then((user)=>{
        parts.findOneAndUpdate({_id:req.body.partId,"availability.shop":req.body.userId},{$inc:{"availability.$.quantity":1}},{new:true}).then((part)=>{
            res.send({user:user,part:part})
        }).catch((err)=>{
          console.log(err)
          res.status(400).send({message:"Bad Request"})
        })
      }).catch((err)=>{
        console.log(err)
        res.status(400).send({message:"Bad Request"})
      })
    }
    else{
      newItem = {
        part:req.body.partId,
        quantity:1
      }
      newAvailable = {
        shop:req.body.userId,
        quantity:1
      }
      users.findByIdAndUpdate(req.body.userId,{
        $push:{inventory:newItem}
      },{new:true}).then((user)=>{
        parts.findByIdAndUpdate(req.body.partId,{
          $push:{availability:newAvailable}
        },{new:true}).then((part)=>{
          res.send({user:user,part:part})
        }).catch((err)=>{
          console.log(err)
          res.status(400).send({message:"Bad Request"})
        })
      }).catch((err)=>{
        console.log(err)
        res.status(400).send({message:"Bad Request"})
      })
    }
  })
})

router.delete("/inventory",partnerValidate,(req,res)=>{
  users.findById(req.body.userId).then((user)=>{
    if(user.inventory.filter(item => item.part == req.body.partId)[0].quantity > 1){
      users.findOneAndUpdate({_id:req.body.userId,"inventory.part":req.body.partId},{$inc:{"inventory.$.quantity":-1}},{new:true}).then((user)=>{
        parts.findOneAndUpdate({_id:req.body.partId,"availability.shop":req.body.userId},{$inc:{"availability.$.quantity":-1}},{new:true}).then((part)=>{
            res.send({user:user,part:part})
        }).catch((err)=>{
          console.log(err)
          res.status(400).send({message:"Bad Request"})
        })
      }).catch((err)=>{
        console.log(err)
        res.status(400).send({message:"Bad Request"})
      })
    }
    else{
      users.findByIdAndUpdate(req.body.userId,{
        $pull:{inventory:{part:req.body.partId}}
      },{new:true}).then((user)=>{
        parts.findByIdAndUpdate(req.body.partId,{
          $pull:{availability:{shop:req.body.userId}}
        },{new:true}).then((part)=>{
          res.send({user:user,part:part})
        }).catch((err)=>{
          console.log(err)
          res.status(400).send({message:"Bad Request"})
        })
      }).catch((err)=>{
        console.log(err)
        res.status(400).send({message:"Bad Request"})
      })
    }
  })
})

router.get("/order",partnerValidate,(req,res)=>{
  order.find(req.query).populate("buyer items").then((orders)=>{
    res.send(orders)
  }).catch((err)=>{
    console.log(err)
    res.status(400).send({message:"Bad Request"})
  })
})

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
