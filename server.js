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
client.flushall();

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

var CHECKIN_EXPIRATION_MS = 60 * 5;

function getAllDogs(callback) {
  client.smembers('dogs', function(err, dogs) {
    var multi = client.multi();
    dogs.forEach(function(dogId) {
      multi.get('dog:' + dogId);
      multi.get('dog:' + dogId + ':checked_in');
    });

    multi.exec(function(err, replies) {
      var dogs = chunk(replies, 2).map(function(d) {
        var dog = JSON.parse(d[0]);
        var checkin = JSON.parse(d[1]);

        return {
          display_id: dog.display_id,
          name: dog.name,
          short_description: dog.short_description,
          owner: dog.owner,
          avatar: dog.avatar,
          checked_in: checkin
        };
      });
      callback(dogs);
    });
  });
}

function getDogById(dogId, callback) {
  var multi = client.multi();
  multi.get('dog:' + dogId);
  multi.get('dog:' + dogId + ':checked_in');

  multi.exec(function(err, d) {
    var dog = JSON.parse(d[0]);
    var checkin = JSON.parse(d[1]);

    if (dog) {
      callback({
        display_id: dog.display_id,
        name: dog.name,
        short_description: dog.short_description,
        owner: dog.owner,
        avatar: dog.avatar,
        checked_in: checkin
      });
    } else {
      callback();
    }
  });
}

function getAllDevices(callback) {
  client.smembers('btle_devices', function(err, deviceIds) {
    callback(deviceIds);
  });
}

function storeDogInRedis(dog) {
  if (dog && dog.btle_devices && dog.btle_devices.length > 0) {
    var deviceId = dog.btle_devices[0].device_id;
    client.sadd('dogs', dog.display_id);
    client.sadd('btle_devices', deviceId);
    client.set('dog:' + dog.display_id, JSON.stringify(dog));
    client.set('btle_device:' + deviceId + ':dog', dog.display_id);
  }
}

function checkinDeviceAtLocationTime(deviceId, location, time, callback) {
  client.get('btle_device:' + deviceId + ':dog', function(err, dogId) {
    if (!err && dogId) {
      // check dog in at last seen hydrant at time
      var newCheckin = { location: location, time: time };

      // TODO check that time is newer than CHECKIN_EXPIRATION_MS in the past
      // TODO check that time is newer than our last seen checkin
      // client.get('dog:' + dogId + ':checked_in', function(err, checkin) {
      //   if (!err && checkin) {
      //
      //   }
      // })

      client.set('dog:' + dogId + ':checked_in', JSON.stringify(newCheckin), function(err, reply) {
        // set the key to expire after 5 minutes
        if (!err && reply == 'OK') {
          client.expire('dog:' + dogId + ':checked_in', CHECKIN_EXPIRATION_MS);
          callback(true);
        } else {
          callback(false);
        }
      });
    } else {
      callback(false);
    }
  });
}


// load data into redis from isl api
var TOKEN = process.env.ISL_API_TOKEN;
request.get({
  url: 'https://api.isl.co/v1/pets/',
  headers: {
    'Authorization': 'Token ' + TOKEN
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
      // TODO move detail view to list view in api and remove this loop
      // haven't requested dog detail view yet
      request.get({
        url: dog.pet_link,
        headers: {
          'Authorization': 'Token ' + TOKEN
        }
      }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          dog = JSON.parse(body);
          storeDogInRedis(dog);
        } else {
          // read dog from fixture
          var d = require('./fixtures/dog.json');
          dog = find(d, { display_id: dog.display_id});
          storeDogInRedis(dog);
        }
      });
    }
  });
});


app.get('/api/dogs/:display_id', function(req, res) {
  getDogById(req.params.display_id, function(dog) {
    if (dog) {
      res.json(dog);
    } else {
      res.status(404).json({ status: 404, textStatus: 'Not Found' });
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
  getAllDogs(function(dogs) {
    if (dogs.length) {
      res.json(dogs);
    } else {
      res.status(404).json({ status: 404, textStatus: 'Not Found' });
    }
  });
});

app.get('/api/devices', function(req, res) {
  getAllDevices(function(devices) {
    if (devices.length) {
      res.json(devices);
    } else {
      res.status(404).json({ status: 404, textStatus: 'Not Found' });
    }
  });
});

app.post('/api/event', function(req, res) {
  var events = req.body.events;
  events.forEach(function(event, index) {
    var device = event.device;
    var location = event.location;
    var time = event.time;

    console.log('Event received from ' + device + ' at ' + time + ' from ' + location);

    checkinDeviceAtLocationTime(device, location, time, function() {
      if (index === events.length - 1) {
        res.json({ status: 200, textStatus: 'OK' });
      }
    });
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
