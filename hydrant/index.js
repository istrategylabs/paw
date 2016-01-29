var noble = require('noble');
var request = require('request-json');

//var apiURL = process.env.APIURL;
var LOCATION = 'kitchen';
var apiURL = 'http://47b7979c.ngrok.com/api/event';
var client = request.createClient(apiURL);

// Variables to help us increase accuracy
var RSSI_THRESHOLD    = -90;
var EXIT_GRACE_PERIOD = 2000; // milliseconds
var API_UPDATE_INTERVAL = 5000; // milliseconds

var seenDeviceIds = [];
var eventQueue = [];

// Currently hard-coded list of dogs and their device IDs
var listenDeviceIds = [
  'c3:63:96:6d:58:99'
];

function updateAPI() {
  // send event queue to server
  console.log('POSTing sending events', eventQueue);
  client.post(apiURL, { events: eventQueue }, function(err, res, body) {
    console.log(res.statusCode)
    eventQueue.length = 0;
    seenDeviceIds.length = 0;
  });
}

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    console.log('scanning...');
    noble.startScanning([], true);

    setInterval(updateAPI, 10000);
  } else {
    console.log("Error...not connected or cannot connect");
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  if (peripheral.rssi < RSSI_THRESHOLD) {
    return;
  }

  var deviceId = peripheral.address;
  if (listenDeviceIds.indexOf(deviceId) > -1 && seenDeviceIds.indexOf(deviceId) === -1) {
    // queue event to be sent if we recognize the device and have not queued an event yet
    seenDeviceIds.push(deviceId);
	 var eventPayload = {
      device: deviceId,
      location: LOCATION,
      time: Date.now()
    };
    eventQueue.unshift(eventPayload);
  }
});
