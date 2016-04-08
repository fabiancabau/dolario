var express = require('express'),
    request = require('request'),
    app = express(),
    server = require('http').Server(app),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    mining = require('./helpers/mining'),

    mongoose = require('mongoose'),
    User = require('./models/user');

var db = mongoose.connection;

db.on('error', console.error);

db.once('open', function() {
  console.log('Connected to MongoDB successfully');
});

mongoose.connect('mongodb://localhost/dolario');

console.log('Listening on port 3000');
server.listen(3000);

//Configuring middlewares
app.use(cors());

app.use(bodyParser.urlencoded({
  extended: true
}));


//Routing stuff
app.get('/', function (req, res) {
  var currency = {};
  res.set({'Content-Type': 'application/json'});

  mining.getCachedDolar().then(function(value) { 
    currency.dolar = JSON.parse(value);
    mining.getCachedLibra().then(function(value) { 
      currency.libra = JSON.parse(value);
      mining.getCachedEuro().then(function(value) { 
        currency.euro = JSON.parse(value);
        res.json(currency);
      });
    });
  }); 
});


app.post('/api/users', function (req, res) {

  // Create a new instance of the Beer model
  var user = new User();

  // Set the beer properties that came from the POST data
  user.userId = req.body.userId;
  user.pushToken = req.body.pushToken;
  user.notification = false;
  user.notification_type = '';

  // Save the beer and check for errors
  user.save(function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'User added to database', data: user });
  });
  
});


// app.post('/api/users/notification', function (req, res) {

//   var headers = {
//     "Content-Type": "application/json",
//     "Authorization": "Basic ZjIwMjliNmUtM2RlMC00Nzc1LWI4NTYtNjZkY2VhYzNkYTdj"
//   };

//   var message = { 
//     app_id: "08b0ff23-22f2-467d-aab1-99dcad042d76",
//     contents: {"en": "Estevan Viado"},
//     headings: {"en": "Cotação do Dólar"},
//     included_segments: ["All"]
//   };

//   var options = {
//     host: "onesignal.com",
//     port: 443,
//     path: "/api/v1/notifications",
//     method: "POST",
//     headers: headers
//   };


//   var request = require('request');

//   request.post({
//     headers: headers,
//     json:    true,
//     url:     'https://onesignal.com/api/v1/notifications',
//     body:    message
//   }, function(error, response, body){
//     console.log(response);
//     res.json({ message: 'Notifications sent', data: response, body: body });
//   });


  
// });
