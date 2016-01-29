var env = process.env.NODE_ENV || 'development';
var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var redis = require('redis');
var request = require('request');
var chunk = require('lodash/chunk');
var find = require('lodash/find');

var redisURL = process.env.REDIS_URL;
var client = redis.createClient(redisURL);
// client.flushall();

var app = express();
app.set('port', (process.env.PORT || 3000));
app.use(compression({ level: 9 }));
app.use(bodyParser.json());
app.use(express.static('public'));


var forceSSL = function (req, res, next) {
  // use req.headers.referrer !startsWith https
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
  url: 'https://api.isl.co/api/v1/pets/',
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
  // set btle_device to redis set
  // set dog:id to btle_device
  dogs.forEach(function(dog) {
    if (dog.display_id && dog.pet_link) {
      // TODO move detail view to list view and remove this
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
          d = find(d, { display_id: dog.display_id});
        }

        if (d.btle_devices.length > 0) {
          dog = d;
          var deviceId = dog.btle_devices[0].device_id;
          client.sadd('dogs', dog.display_id);
          client.set('dog:' + dog.display_id, JSON.stringify(d));
          client.set('btle_device:' + deviceId + ':dog', dog.display_id);
        }
      });
    }
  });
});


app.get('/api/dogs/:display_id', function(req, res) {
  client.get('dog:' + req.params.display_id, function(err, d) {
    if (!err && d) {
      var dog = JSON.parse(d);

      client.sismember('dogs:checked_in', JSON.stringify(dog.display_id), function(err, checkedIn) {
        res.send({
          display_id: dog.display_id,
          name: dog.name,
          owner: dog.owner,
          avatar: dog.avatar,
          device_id: dog.btle_devices[0].device_id,
          checked_in: !!(checkedIn)
        });
      });
    } else {
      res.status({ status: 404, textStatus: 'Not Found' });
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
    dogs.forEach(function(dogId) {
      multi.get('dog:' + dogId);
      // FIXME why does sismember not find this when set by event
      multi.sismember('dogs:checked_in', JSON.stringify(dogId));
    });

    multi.exec(function(err, replies) {
      res.send(chunk(replies, 2).map(function(d) {
        var dog = JSON.parse(d[0]);
        var checkedIn = d[1];
        return {
          display_id: dog.display_id,
          name: dog.name,
          owner: dog.owner,
          avatar: dog.avatar,
          device_id: dog.btle_devices[0].device_id,
          checked_in: !!(checkedIn)
        };
      }));
    });
  });
});

app.post('/api/event', function(req, res) {
  var event = req.body.event;
  var device = event.device;
  var location = event.location;

  client.sadd('dogs:checked_in', '39pABg');

  client.get('btle_device:' + device + ':dog', function(err, dogId) {
    if (!err && dogId) {
      // check dog in
      client.sadd('dogs:checked_in', JSON.stringify(dogId));

      // Set key in redis store for last known hydrant
      client.set('btle_device:' + device, location, function(err, reply) {
        // Set the key to expire after 5 minutes
        client.expire('btle_device:' + device, 60 * 5, function(err) {
          if (!err) {
            client.srem('dogs:checked_in', dogId);
          }
        });

        res.json({ status: '200', textStatus: 'OK' });
      });
    } else {
      res.json({ status: '404', textStatus: 'Not Found' });
    }
  });
});

// Redis-specific code and configuration
client.on('error', function(err) {
  console.log('Error: ', err);
});

// Starting the express server
var server = app.listen(app.get('port'), function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('paw-api listening at http://%s:%s', host, port);
});
