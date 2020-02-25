const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'citra.app.mailer@gmail.com',
    pass: 'royya1234'
  },
  tls:{
    rejectUnauthorized:false
  }
});

module.exports = transporter
