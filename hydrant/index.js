var request = require('request');
var noble = require('noble');
var request = require('request-json');

//var apiURL = process.env.APIURL;
var LOCATION = process.env.ENVIRONMENT;
var apiURL = 'http://requestb.in/11gduk11'
var client = request.createClient(apiURL);

// Variables to help us increase accuracy
var RSSI_THRESHOLD    = -90;
var EXIT_GRACE_PERIOD = 2000; // milliseconds

var inRange = [];

// Currently hard-coded list of dogs and their device IDs
var dogs = [
  "c3:63:96:6d:58:99"
]

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    console.log('scanning...');
    noble.startScanning([], true);
  }
  else {
    console.log("Error...not connected or cannot connect");
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  if (peripheral.rssi < RSSI_THRESHOLD) {
    return;
  }

  var id = peripheral.address;
  updateAPI(id);

});


function updateAPI(deviceID) {

  payload = {
    event: {
      device: deviceID,
      location: LOCATION
    }
  }

  if (dogs.indexOf(deviceID) > -1) {
    console.log("POSTING EVENT");
    //client.post('event/', payload, function(err, res, body) {
    client.post(apiURL, payload, function(err, res, body) {
        return console.log(res.statusCode);
    });
  }
}
