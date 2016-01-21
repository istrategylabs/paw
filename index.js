var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('port', (process.env.PORT || 3000));

var redisURL = process.env.REDIS_URL;
var redis = require('redis');
var client = redis.createClient(redisURL);

app.use(bodyParser.json());
app.use(express.static('client/public'));

// app.get('/', function (req, res) {
//   res.send('Welcome to PAW!');
// });

app.get('/dogs', function (req, res) {
  client.keys('*', function (err, keys) {
    res.json({dogs: keys});
  });
});

app.post('/event', function (req, res) {
  dogName = req.body.event.dog;
  status = req.body.event.inOffice;
  console.log('Request: ', req.body.event);

  // Set key in redis store
  client.set(dogName, status);

  // Set the key to expire after 5 minutes
  client.expire(dogName, 60 * 5);

  res.json({status: 'success'});
});

// Redis-specific code and configuration
client.on('error', function (err) {
  console.log('Error ' + err);
});

// Starting the express server
var server = app.listen(app.get('port'), function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('paw-api listening at http://%s:%s', host, port);
});
