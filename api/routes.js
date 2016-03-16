var Dogs = require('./models/dogs');
var Devices = require('./models/devices');


module.exports = function(app) {
  app.get('/api/dogs/:display_id', function(req, res) {
    Dogs.getDogById(req.params.display_id, function(dog) {
      if (dog) {
        res.json(dog);
      } else {
        res.status(404).json({ status: 404, textStatus: 'Not Found' });
      }
    });
  });

  app.get('/api/dogs', function(req, res) {
    Dogs.getAllDogs(function(dogs) {
      if (dogs.length) {
        res.json(dogs);
      } else {
        res.status(404).json({ status: 404, textStatus: 'Not Found' });
      }
    });
  });

  app.get('/api/devices', function(req, res) {
    Devices.getAllDevices(function(devices) {
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

      Devices.checkinDeviceAtLocationTime(device, location, time, function() {
        if (index === events.length - 1) {
          res.json({ status: 200, textStatus: 'OK' });
        }
      });
    });
  });
};
