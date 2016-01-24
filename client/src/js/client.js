/* global gapi */

var Backbone = require('backbone');
var jQuery = require('jquery');
Backbone.$ = jQuery;
var WebFont = require('webfontloader');
var AppRouter = require('./router');
var SessionModel = require('./models/SessionModel');
var app = require('./app');
var initialized = false;
var authListener;


WebFont.load({
  typekit: {
    id: 'nki8bkd'
  }
});


function auth2SignInChanged() {
  // auth2SignInChanged() is a function from Google's
  // authentication API. If a sign in change occurs, auth2 notes
  // that change and calls this function.

  //When auth2SignInChanged() is called, we then call the checkAuth() function in the SessionModel.
  app.session.checkAuth({

    //success:/error: - called back from Session Model if a user is (un)successfully signed in
    success: function() {
      console.log('auth changed: user signed in, start at dashboard');
      app.router.navigate('dashboard', { trigger: true, replace: true });
      auth2UserChangeListener();
    },
    error: function() {
      console.log('auth changed: user signed out, force user to index');
      app.router.navigate('/', { trigger: true, replace: true });
    }
  });
}

function auth2UserChangeListener() {
  if (authListener) {
    authListener.remove();
  }

  var auth2 = gapi.auth2.getAuthInstance();
  console.log('started router');
  authListener = auth2.currentUser.listen(auth2SignInChanged);
  console.log('listening for user changes');
}

function auth2SignInChangeListener() {
  if (authListener) {
    authListener.remove();
  }

  var auth2 = gapi.auth2.getAuthInstance();
  app.router.navigate('/', { trigger: true, replace: true });
  console.log('started router');
  authListener = auth2.isSignedIn.listen(auth2SignInChanged);
  console.log('listening for auth changes');
}

global.clientInit = function() {
  if (window.gapi && !initialized) {
    global.onGAPILoadCallback();
  }
};

global.onGAPILoadCallback = function() {
  initialized = true;
  console.log('Google API platform.js loaded');

  gapi.load('auth2', function() {
    console.log('Google API auth2 loaded');

    app.session = new SessionModel({});
    app.router = new AppRouter();

    gapi.auth2.init({
      client_id: '205257899023-7td7rf43jc7hj6bs2evdib68m811c2e3.apps.googleusercontent.com',
      fetch_basic_profile: true
    }).then(function() {
      var auth2 = gapi.auth2.getAuthInstance();
      var googleUserIsSignedIn = auth2.isSignedIn.get();

      if (googleUserIsSignedIn) {
        console.log('auth found, checking');
        app.session.checkAuth({
          success: auth2UserChangeListener,
          error: function() {
            if (googleUserIsSignedIn) {
              auth2UserChangeListener();
            } else {
              auth2SignInChangeListener();
            }
          },
          complete: function() {
            if (app.session.get('logged')) {
              app.router.navigate('dashboard', { trigger: true, replace: true });
            }
            Backbone.history.start();
          }
        });
      } else {
        console.log('no auth found');
        auth2SignInChangeListener();
        Backbone.history.start();
      }
    }, function() {
      console.log('failed to load auth, forcce user to index');
      app.router.navigate('/', { trigger: true, replace: true });
    });
  });
};
