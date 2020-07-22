const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
var mongoose = require('mongoose');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));


var auth = require('./routes/auth');
var adminRoutes = require('./routes/adminRoutes');
var shopRoutes = require('./routes/shopRoutes');
var partnerRoutes = require('./routes/partnerRoutes');
var condtitionGradingRoutes = require('./routes/conditionGradingRoutes')

app.use((req,res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});



app.use("/auth",auth)
app.use("/admin",adminRoutes)
app.use("/shop",shopRoutes)
app.use("/partner",partnerRoutes)
app.use("/conditionGrading",condtitionGradingRoutes)


mongoose.connect('mongodb+srv://dbman:royya123@recyclr-pj0vn.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.set('useCreateIndex',true);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("DB connection successful")
  app.listen(port, () => console.log(` app listening on port ${port}!`))

});

module.exports = app
