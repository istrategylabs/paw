var chunk = require('lodash/chunk');
var redis = require('../database');

var Dogs = {
  storeDogInRedis: function(dog) {
    if (dog && dog.btle_devices && dog.btle_devices.length > 0) {
      var deviceId = dog.btle_devices[0].device_id;
      redis.sadd('dogs', dog.display_id);
      redis.sadd('btle_devices', deviceId);
      redis.set('dog:' + dog.display_id, JSON.stringify(dog));
      redis.set('btle_device:' + deviceId + ':dog', dog.display_id);
    }
  },

  getAllDogs: function(callback) {
    redis.smembers('dogs', function(err, dogs) {
      var multi = redis.multi();
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
  },

  getDogById: function(dogId, callback) {
    var multi = redis.multi();
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
};


module.exports = Dogs;
