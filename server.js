var env = process.env.NODE_ENV || 'development';
var express = require('express');
var compression = require('compression')
var bodyParser = require('body-parser');
var redis = require('redis');
var request = require('request');
var find = require('lodash/find');

var redisURL = process.env.REDIS_URL;
var client = redis.createClient(redisURL);
client.flushall();

var app = express();
app.set('port', (process.env.PORT || 3000));
app.use(compression({ level: 9 }));
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
// on get: if we know about the dog
//           havent seen detail dog yet?
//             request detail dog
//           set detail dog response to display_id
//
// on post:
//
// on put:
//
//
// States:
// checked in
//   in office
//   out of office
//   missing
// checked out


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
      client.sadd('dogs', dog.display_id);
      client.set('dog:' + dog.display_id, JSON.stringify(dog));
    }
  });
});


app.get('/api/dogs/:display_id', function(req, res) {
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
            // TODO pick dog from known fixtures
            d = find(d, { display_id: req.params.display_id});
          }

          client.set('dog:' + d.display_id, JSON.stringify(d));
          dog = d;
          res.send({
            display_id: dog.display_id,
            name: dog.name,
            owner: dog.owner,
            avatar: dog.avatar,
            checked_in: false
          });
        });
      } else {
        res.send({
          display_id: dog.display_id,
          name: dog.name,
          owner: dog.owner,
          avatar: dog.avatar,
          checked_in: false
        });
      }
    } else {
      res.status(404);
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
    var multi = client.multi();
    dogs.forEach(function(dog_display_id) {
      multi.get('dog:' + dog_display_id);
    });

    multi.exec(function(err, replies) {
      res.send(replies.map(function(dog) {
        var d = JSON.parse(dog);
        return {
          display_id: d.display_id,
          name: d.name,
          owner: d.owner,
          checked_in: false
        };
      }));
    });
  });
});

app.post('/api/event', function(req, res) {
  var dogName = req.body.event.dog;
  var status = req.body.event.inOffice;

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
