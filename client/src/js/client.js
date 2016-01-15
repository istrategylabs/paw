/* global gapi */

var Backbone = require('backbone');
var jQuery = require('jquery');
Backbone.$ = jQuery;
var AppRouter = require('./router');
var SessionModel = require('./models/SessionModel');
var app = require('./app');

app.router = new AppRouter();
app.session = new SessionModel({});


global.onGAPILoadCallback = function() {
  console.log('Google API platform.js loaded');
  gapi.load('auth2', function() {
    console.log('Google API auth2 loaded');

    gapi.auth2.init({
      client_id: '205257899023-7td7rf43jc7hj6bs2evdib68m811c2e3.apps.googleusercontent.com',
      fetch_basic_profile: true
    });
    var auth2 = gapi.auth2.getAuthInstance();

    app.session.checkAuth({
      complete: function() {
        console.log('completed auth check');
        var hasPushstate = !!(window.history && history.pushState);
        if (hasPushstate) {
          Backbone.history.start({ pushState: true, root: '/' });
        } else {
          Backbone.history.start();
        }

        console.log('started router');
      }
    });

    auth2.isSignedIn.listen(function() {
      app.session.checkAuth({
        success: function() {
          console.log('user signed in');
        },
        error: function() {
          console.log('user signed out');
          // app.navigate('/', { trigger: true, replace: true });
        },
      });
    });
  });
};
