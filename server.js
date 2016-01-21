var express = require('express');
var bodyParser = require('body-parser');
var redis = require('redis');

var redisURL = process.env.REDIS_URL;
var client = redis.createClient(redisURL);

var app = express();
app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/api/dog/:id', function(req, res) {
  res.json({ status: 200, dog: { id: req.params.id }});
});

app.put('/api/dog/:id', function(req, res) {
  res.json({ status: 204 });
});

app.post('/api/dog', function(req, res) {
  res.json({ status: 201, dog: { }});
});

app.get('/api/dogs', function(req, res) {
  // client.keys('*', function(err, keys) {
  //   res.json({ dogs: keys });
  // });
  res.json({
    status: 200,
    dogs: [
      { id: 1, name: 'watson' },
      { id: 2, name: 'maggie' }
    ]
  });
});

app.post('/api/event', function(req, res) {
  var dogName = req.body.event.dog;
  var status = req.body.event.inOffice;
  console.log('Request: ', req.body.event);

  // Set key in redis store
  client.set(dogName, status);

  // Set the key to expire after 5 minutes
  client.expire(dogName, 60 * 5);

  res.json({status: 'success'});
});

// Redis-specific code and configuration
client.on('error', function(err) {
  console.log('Error ' + err);
});

// Starting the express server
var server = app.listen(app.get('port'), function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('paw-api listening at http://%s:%s', host, port);
});
