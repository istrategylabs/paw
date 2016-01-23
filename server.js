var env = process.env.NODE_ENV || 'development';
var express = require('express');
var bodyParser = require('body-parser');
var redis = require('redis');
var request = require('request');

var redisURL = process.env.REDIS_URL;
var client = redis.createClient(redisURL);

var app = express();
app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.json());
app.use(express.static('public'));


var forceSSL = function (req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  }
  return next();
};

if (env === 'production') {
  app.use(forceSSL);
}


// load data into redis from isl api
var token = process.env.ISL_API_TOKEN;
request.get({
  url: 'https://isl-api-staging.herokuapp.com/api/v2/pets/',
  headers: {
    'Authorization': 'Token ' + token
  }
}, function(error, response, body) {
  client.del('dogs');
  var dogs;

  if (!error && response.statusCode == 200) {
    dogs = JSON.parse(body);
  } else {
    // read dogs list from fixture
    dogs = require('./fixtures/dogs.json');
  }

  // set dogs to redis
  dogs.forEach(function(dog) {
    client.lpush('dogs', JSON.stringify(dog));
  });
});


app.get('/api/dog/:id', function(req, res) {
  res.json({ id: req.params.id });
});

app.put('/api/dog/:id', function(req, res) {
  res.json({ id: req.params.id });
});

app.post('/api/dog', function(req, res) {
  res.json({ id: 0 });
});

app.get('/api/dogs', function(req, res) {
  client.llen('dogs', function(err, len) {
    console.log(len);
    client.lrange('dogs', 0, len-1, function(err, dogs) {
      console.log(dogs);
      res.json(dogs.map(function(dog) {
        return JSON.parse(dog);
      }));
    });
  });

  // res.json([
  //   { id: 1, name: 'watson' },
  //   { id: 2, name: 'maggie' }
  // ]);
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
