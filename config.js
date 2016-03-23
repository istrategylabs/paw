var nconf = require('nconf');

nconf.env().argv();

nconf.defaults({
  // api server port for client connections
  PORT: 3000,

  // cache duration for static files served by express, in seconds
  CACHE_CONTROL_MAX_AGE_S: nconf.get('NODE_ENV') === 'production' ? 604800 : 0,

  // auth token for requests to api.isl.co
  ISL_API_TOKEN: '',

  // redis server connection url
  REDIS_URL: 'redis://127.0.0.1:6379',

  // how long to display an error to the user, in milliseconds
  ERROR_DISPLAY_TIMEOUT_MS: 5 * 1000,

  // when to delete seen device checkin from redis, in seconds
  DEVICE_CHECKIN_EXPIRATION_S: 20,

  // how often Backbone fetches dogs from api, in milliseconds
  DOGS_POLLING_INTERVAL_MS: 10 * 1000,

  // OAuth client id for Google Auth2
  GAPI_CLIENT_ID: '935134788841-0ur9mf9ffnsj12t4f4b2mq8kh8icjfvp.apps.googleusercontent.com'
});

module.exports = nconf;
