var express = require('express');
var request = require('request');
var app = express();
var server = require('http').Server(app);
var path = require('path');

var bodyParser = require('body-parser');
var cors = require('cors');

var Sequence = require('sequence').Sequence;
var sequence = Sequence.create();

var mining = require('./helpers/mining');
var pushNotifications = require('./helpers/pushnotifications');

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


app.use(cors());
// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

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

var schedule = require('node-schedule');

var hourlyRule = new schedule.RecurrenceRule();
hourlyRule.dayOfWeek = [new schedule.Range(1, 5)];
hourlyRule.minute = 0;

var hourly = schedule.scheduleJob(hourlyRule, function(){
  console.log('Hourly cron function running', new Date().toString());
  pushNotifications.sendHourly();
});

var openingRule = new schedule.RecurrenceRule();
openingRule.dayOfWeek = [new schedule.Range(1, 5)];
openingRule.minute = 0;
openingRule.hour = 9;

var opening = schedule.scheduleJob(openingRule, function(){
  console.log('Opening cron function running', new Date().toString());
});

var closingRule = new schedule.RecurrenceRule();
closingRule.dayOfWeek = [new schedule.Range(1, 5)];
closingRule.minute = 0;
closingRule.hour = 17;

var closing = schedule.scheduleJob(closingRule, function(){
  console.log('Closing cron function running', new Date().toString());
});

var sanity = schedule.scheduleJob('*/1 * * * *', function(){
  console.log('Sanity cron function running', new Date().toString());
});

var cacheCurrency = schedule.scheduleJob('*/10 * * * *', function(){
  console.log('Cache cron function running', new Date().toString());
  mining.cacheCurrencies();
});

