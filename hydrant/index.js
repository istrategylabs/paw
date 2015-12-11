var request = require('request');
var noble = require('noble');
var request = require('request-json');

var apiURL = process.env.APIURL;
var client = request.createClient(apiURL);

// Variables to help us increase accuracy
var RSSI_THRESHOLD    = -90;
var EXIT_GRACE_PERIOD = 2000; // milliseconds

var inRange = [];

// Currently hard-coded list of dogs and their device IDs
var dogs = {
  '405ecc6487f44812a3b9718474eb5c83': 'watson',
  'bf978ce4d9734185a4c58d40a50365b6': 'barkley'
}

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    console.log('scanning...');
    noble.startScanning([], true);
  }
  else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  if (peripheral.rssi < RSSI_THRESHOLD) {
    return;
  }

  var id = peripheral.id;
  var entered = !inRange[id];

  if (entered) {
    // The dog has entered the device's radius...mark as 'entered'
    inRange[id] = {
      peripheral: peripheral
    };

    // Update the API with the information as well
    updateAPI(id);
  }

  inRange[id].lastSeen = Date.now();
});

// This is how we will tell if someone has exited
setInterval(function() {
  for (var id in inRange) {
    if (inRange[id].lastSeen < (Date.now() - EXIT_GRACE_PERIOD)) {
      var peripheral = inRange[id].peripheral;
      delete inRange[id];
    }
  }
}, EXIT_GRACE_PERIOD / 2);

function updateAPI(deviceID) {

  payload = {
    event: {
      dog: dogs[deviceID],
      inOffice: true
    }
  }

  if (deviceID in dogs) {
    client.post('event/', payload, function(err, res, body) {
        return console.log(res.statusCode);
    });
  }
}
