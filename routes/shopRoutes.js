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

router.put("/part/:id",adminValidate,(req,res)=>{
  parts.findByIdAndUpdate(req.params.id,req.body,{new:true}).then((result)=>{
    res.send(result)
  }).catch((err)=>{
    console.log(err)
    res.status(400).send({message:"Invalid Query"})
  })
})

router.delete("/part/:id",adminValidate,(req,res)=>{
  parts.findByIdAndRemove(req.params.id).then((result)=>{
    res.send(result)
  }).catch((err)=>{
    console.log(err)
    res.status(400).send({message:"Invalid Query"})
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

router.put("/device/:id",adminValidate,(req,res)=>{
  devices.findByIdAndUpdate(req.params.id,req.body,{new:true}).populate("parts").then((result)=>{
    res.send(result)
  }).catch((err)=>{
    console.log(err)
    res.status(400).send({message:"Invalid Query"})
  })
})

router.delete("/device/:id",adminValidate,(req,res)=>{
  devices.findByIdAndRemove(req.params.id).populate("parts").then((result)=>{
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



router.get("/cart",userValidate,(req,res)=>{
  users.findById(req.body.userId).populate("cart.part").then((user)=>{
    res.send(user)
  }).catch((err)=>{
    console.log(err)
    res.status(500).send({message:"Internal Error"})
  })
})

router.post("/cart",userValidate,(req,res)=>{
  parts.findById(req.body.partId).then((part)=>{
    if(part.availability.length==0){
      res.status(404).send({message:"Part Not In Stock"})
    }
    else if(part.availability[0].quantity > 1){
      users.findOneAndUpdate({_id:part.availability[0].shop,"inventory.part":req.body.partId},{$inc:{"inventory.$.quantity":-1}},{new:true}).then((partner)=>{
        parts.findOneAndUpdate({_id:req.body.partId,"availability.shop":part.availability[0].shop},{$inc:{"availability.$.quantity":-1}},{new:true}).then((updatedPart)=>{
          newCartItem = {
            part:updatedPart._id
          }
          users.findByIdAndUpdate(req.body.userId,{
            $push:{cart:newCartItem},
            $inc:{cartValue:updatedPart.price}
          },{new:true}).then((user)=>{
            res.send(user)
          }).catch((err)=>{
            console.log(err)
            res.status(400).send("Bad Request")
          })
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
      users.findByIdAndUpdate(part.availability[0].shop,{
        $pull:{inventory:{part:req.body.partId}}
      },{new:true}).then((partner)=>{
        parts.findByIdAndUpdate(req.body.partId,{
          $pull:{availability:{shop:part.availability[0].shop}}
        },{new:true}).then((updatedPart)=>{
          newCartItem = {
            part:updatedPart._id
          }
          users.findByIdAndUpdate(req.body.userId,{
            $push:{cart:newCartItem},
            $inc:{cartValue:updatedPart.price}
          },{new:true}).then((user)=>{
            res.send(user)
          }).catch((err)=>{
            console.log(err)
            res.status(400).send("Bad Request")
          })
        }).catch((err)=>{
          console.log(err)
          res.status(400).send({message:"Bad Request"})
        })
      }).catch((err)=>{
        console.log(err)
        res.status(400).send({message:"Bad Request"})
      })
    }
  }).catch((err)=>{
    console.log(err)
    res.status(400).send({message:"Bad Request"})
  })
})

router.delete("/cart",userValidate,(req,res)=>{
  users.findByIdAndUpdate(req.body.userId,{$set:{cart:[]},cartValue:0},{new:true}).then((user)=>{
    res.send(user)
  }).catch((err)=>{
    console.log(err)
    res.status(400).send({message:"Bad Request"})
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
    users.findById(id).then((user)=>{
        req.body.userId = id;
        next();
    })
  }).catch((err)=>{
    res.status(403).send({message:"Token Error"})
  })
}
module.exports = router
