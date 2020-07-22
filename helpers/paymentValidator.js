var hmacsha1 = require('crypto-js/hmac-sha1');

var paymentValidator = function(body){
  const ordered = {};
  Object.keys(body).sort().forEach(function(key) {
  ordered[key] = body[key];
  });
  delete ordered["mac"];
  var string = ""
  Object.values(ordered).forEach((element)=>{
  	string = string + element +"|"
  });

  var hash = hmacsha1(string.slice(0,-1),"8d2e7e1d19ef4066ba6509cdea480c8f");
  if(hash.toString()==body.mac){
    return true
  }
  else{
    return false
  }

}

module.exports = paymentValidator
