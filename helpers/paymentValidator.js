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

  var hash = hmacsha1(string.slice(0,-1),"cbb5f98b771f4fd9a733c41d920874f6");
  if((hash.toString()==body.mac) && (body.status=="Credit")){
    return true
  }
  else{
    return false
  }

}

module.exports = paymentValidator
