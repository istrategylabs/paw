var nconf = require('nconf');

nconf.env().argv();

nconf.defaults({
  // node environment
  NODE_ENV: 'development',

  // api server port for client connections
  PORT: 3000,

  // auth token for requests to api.isl.co
  ISL_API_TOKEN: '',

  // redis server connection url
  REDIS_URL: 'redis://127.0.0.1:6379',

  // how long to display an error to the user, in milliseconds
  ERROR_DISPLAY_TIMEOUT_MS: 5 * 1000,

  // when to delete seen device checkin from redis, in seconds
  DEVICE_CHECKIN_EXPIRATION_S: 5 * 60,

  // how often Backbone fetches dogs from api, in milliseconds
  DOGS_POLLING_INTERVAL_MS: 10 * 1000
});

module.exports = nconf;
