/* global gapi */

var Backbone = require('backbone');
var jQuery = require('jquery');
Backbone.$ = jQuery;
var AppRouter = require('./router');
var SessionModel = require('./models/SessionModel');
var app = require('./app');


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
    },
    error: function() {
      console.log('auth changed: user signed out, force user to index');
      app.router.navigate('/', { trigger: true, replace: true });
    }
  });
}

global.onGAPILoadCallback = function() {
  console.log('Google API platform.js loaded');

  gapi.load('auth2', function() {
    console.log('Google API auth2 loaded');

    app.session = new SessionModel({});
    app.router = new AppRouter();

    var auth2 = gapi.auth2.init({
      client_id: '205257899023-7td7rf43jc7hj6bs2evdib68m811c2e3.apps.googleusercontent.com',
      fetch_basic_profile: true
    });

    app.session.checkAuth({
      complete: function() {
        console.log('completed auth check');
        Backbone.history.start();
        console.log('started router');
        console.log('listening for auth changes');

        // auth2.isSignedIn.listen(auth2SignInChanged);
        // FIXME this fires twice due to sign in and user change 
        // both happening, only listen for user change for now 
        // to update all.
        auth2.currentUser.listen(auth2SignInChanged);
      }
    });
  });
};
