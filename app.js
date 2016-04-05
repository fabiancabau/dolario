var express = require('express');
var request = require('request');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var Xray = require('x-ray');

var cors = require('cors');

var Sequence = require('sequence').Sequence;
var sequence = Sequence.create();


var redis = require("redis");
    



console.log('Listening on port 3000');
server.listen(3000);

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use(cors());

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
          res.send(currency);
        });
      });

    }
  });
    
});


app.get('/api/users', function (req, res) {

  res.set({'Content-Type': 'application/json'});

    
});
