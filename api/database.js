var redis = require('redis');
var redisURL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
var client = redis.createClient(redisURL);
var request = require('request');
var find = require('lodash/find');
var Dogs = require('./models/dogs');

// clear redis data on start
client.flushall();

// log redis errors to console
client.on('error', function(err) {
  console.log('Error: ', err);
});


// initialize with data from isl api or fixture
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
          Dogs.save(dog);
        } else {
          // read dog from fixture
          var d = require('./fixtures/dog.json');
          dog = find(d, { display_id: dog.display_id});
          Dogs.save(dog);
        }
      });
    }
  });
});


module.exports = client;
