var env = process.env.NODE_ENV || 'development';
var express = require('express');
var bodyParser = require('body-parser');
var redis = require('redis');
var request = require('request');

var redisURL = process.env.REDIS_URL;
var client = redis.createClient(redisURL);
client.flushall();

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

// Data storage:
//
// on load: request list of dogs from api
//          push display_id's onto list
//          set display_id to dog list response
//
// on get: request detail dog
//         set detail dog response to display_id if we know about the dog


// load data into redis from isl api
var token = process.env.ISL_API_TOKEN;
request.get({
  url: 'https://isl-api-staging.herokuapp.com/api/v2/pets/',
  headers: {
    'Authorization': 'Token ' + token
  }
}, function(error, response, body) {
  var dogs;

  if (!error && response.statusCode == 200) {
    dogs = JSON.parse(body);
  } else {
    // read dogs list from fixture
    dogs = require('./fixtures/dogs.json');
  }

  // set dogs to redis set
  // set dog to redis key
  dogs.forEach(function(dog) {
    if (dog.display_id) {
      console.log('adding', dog);
      client.sadd('dogs', dog.display_id);
      client.set('dog:' + dog.display_id, JSON.stringify(dog));
    }
  });
});


app.get('/api/dog/:display_id', function(req, res) {
  // TODO check client.sismember for dog first
  client.get('dog:' + req.params.display_id, function(err, reply) {
    if (!err && reply) {
      var dog = JSON.parse(reply);

      if (dog.pet_link) {
        // haven't requested dog detail view yet
        request.get({
          url: dog.pet_link,
          headers: {
            'Authorization': 'Token ' + token
          }
        }, function(error, response, body) {
          var d;

          if (!error && response.statusCode == 200) {
            d = JSON.parse(body);
          } else {
            // read dog from fixture
            d = require('./fixtures/dog.json');
          }

          client.set('dog:' + d.display_id, JSON.stringify(d));
          dog = d;
          res.send(dog);
        });
      } else {
        res.send(dog);
      }
    }
  });
});

// app.put('/api/dog/:id', function(req, res) {
//   res.json({ id: req.params.id });
// });

// app.post('/api/dog', function(req, res) {
//   res.json({ id: 0 });
// });

app.get('/api/dogs', function(req, res) {
  client.smembers('dogs', function(err, dogs) {
    console.log('dogs listing:', dogs);

    var multi = client.multi();
    dogs.forEach(function(dog_display_id) {
      multi.get('dog:' + dog_display_id);
    });

    multi.exec(function(err, replies) {
      console.log(replies);
      res.send(replies.map(function(dog) {
        return JSON.parse(dog);
      }));
    });
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
