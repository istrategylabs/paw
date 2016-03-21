/* global gapi */

var Backbone = require('backbone');
var jQuery = require('jquery');
Backbone.$ = jQuery;
var WebFont = require('webfontloader');
var AppRouter = require('./router');
var SessionModel = require('./models/SessionModel');
var app = require('./app');
var initialized = false;


WebFont.load({
  typekit: {
    id: 'nki8bkd'
  }
});


function auth2SigninChange() {
  app.session.checkAuth({
    success: function() {
      console.log('check auth success, go to dashboard');
      app.router.navigate('dashboard', { trigger: true, replace: true });
    },
    error: function() {
      console.log('check auth error, force to index');
      app.router.navigate('/', { trigger: true, replace: true });
    },
    complete: function() {
      if (!Backbone.History.started) {
        console.log('started router');
        Backbone.history.start();
      }
    }
  });
}

function auth2Failure() {
  console.log('failed to load auth, force user to index');
  app.router.navigate('/', { trigger: true, replace: true });
  if (!Backbone.History.started) {
    console.log('started router');
    Backbone.history.start();
  }
}

function initSigninV2() {
  console.log('Google auth2 loaded');

  app.session = new SessionModel({});
  app.router = new AppRouter();

  try {
    gapi.auth2.init({
      client_id: process.env.GAPI_CLIENT_ID,
      fetch_basic_profile: true
    }).then(function() {
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.isSignedIn.listen(auth2SigninChange);

      if (auth2.isSignedIn.get() === true) {
        console.log('auth found, sign in');
        auth2SigninChange();
      } else {
        console.log('no auth found, force to index');
        app.router.navigate('/', { trigger: true, replace: true });
        console.log('started router');
        Backbone.history.start();
      }
    }, auth2Failure);
  } catch (e) {
    auth2Failure();
  }
}

global.clientInit = function() {
  if (window.gapi && !initialized) {
    global.onGAPILoadCallback();
  }
};

global.onGAPILoadCallback = function() {
  initialized = true;
  console.log('Google API platform.js loaded');

  gapi.load('auth2', initSigninV2);
};
