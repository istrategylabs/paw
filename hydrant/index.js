var request = require('request');
var noble = require('noble');

var RSSI_THRESHOLD    = -90;
var EXIT_GRACE_PERIOD = 2000; // milliseconds

console.log('beginning scan...');

var inRange = [];

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    console.log('scanning...');
    noble.startScanning([], false);
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
    // This might need to become a server thing
    inRange[id] = {
      peripheral: peripheral
    };
    console.log(peripheral.uuid);
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
