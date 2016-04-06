var express = require('express');
var request = require('request');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var Xray = require('x-ray');
var bodyParser = require('body-parser');
var cors = require('cors');

var Sequence = require('sequence').Sequence;
var sequence = Sequence.create();


var redis = require("redis");
    
var mongoose = require('mongoose');
var User = require('./models/user');

var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
  console.log('connected to mongodb');

});

mongoose.connect('mongodb://localhost/dolario');


console.log('Listening on port 3000');
server.listen(3000);

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use(cors());
// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function (req, res) {
  var x = Xray();
  var client = redis.createClient({detect_buffers: true});
  currency = { from_cache: false };
  res.set({'Content-Type': 'application/json'});

  client.hkeys("currency", function (err, value) {
    if (value[0] != '') {
      currency = value[0];
      currency.from_cache = true;
      return res.send(currency);
    }
    else {

      sequence.then(function(next) {
        x('http://dolarhoje.com', '#nacional@value')(function(err, val) {
          currency.dolar = val;
          next();
        });
      })
      .then(function(next, err) {
        x('http://dolarhoje.com/libra/', '#nacional@value')(function(err, val) {
          currency.libra = val;
          next();
        });
      })
      .then(function(next, err) {
        x('http://dolarhoje.com/euro/', '#nacional@value')(function(err, val) {
          currency.euro = val;

          client.hset('currency', JSON.stringify(currency), 0, redis.print);
          res.json(currency);
        });
      });

    }
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





app.post('/api/users/notification', function (req, res) {

  var headers = {
    "Content-Type": "application/json",
    "Authorization": "Basic ZjIwMjliNmUtM2RlMC00Nzc1LWI4NTYtNjZkY2VhYzNkYTdj"
  };

  var message = { 
    app_id: "08b0ff23-22f2-467d-aab1-99dcad042d76",
    contents: {"en": "Estevan Viado"},
    headings: {"en": "Cotação do Dólar"},
    included_segments: ["All"]
  };

  var options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers
  };


  var request = require('request');

  request.post({
    headers: headers,
    json:    true,
    url:     'https://onesignal.com/api/v1/notifications',
    body:    message
  }, function(error, response, body){
    console.log(response);
    res.json({ message: 'Notifications sent', data: response, body: body });
  });


  
});


