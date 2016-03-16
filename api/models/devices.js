var CHECKIN_EXPIRATION_MS = 60 * 5;
var redis = require('../database');

exports.getAllDevices = function(callback) {
  redis.smembers('btle_devices', function(err, deviceIds) {
    callback(deviceIds);
  });
};

exports.checkinDeviceAtLocationTime = function(deviceId, location, time, callback) {
  redis.get('btle_device:' + deviceId + ':dog', function(err, dogId) {
    if (!err && dogId) {
      // check dog in at last seen hydrant at time
      var newCheckin = { location: location, time: time };

      // TODO check that time is newer than CHECKIN_EXPIRATION_MS in the past
      // TODO check that time is newer than our last seen checkin
      // redis.get('dog:' + dogId + ':checked_in', function(err, checkin) {
      //   if (!err && checkin) {
      //
      //   }
      // })

      redis.set('dog:' + dogId + ':checked_in', JSON.stringify(newCheckin), function(err, reply) {
        // set the key to expire after 5 minutes
        if (!err && reply == 'OK') {
          redis.expire('dog:' + dogId + ':checked_in', CHECKIN_EXPIRATION_MS);
          callback(true);
        } else {
          callback(false);
        }
      });
    } else {
      callback(false);
    }
  });
};
