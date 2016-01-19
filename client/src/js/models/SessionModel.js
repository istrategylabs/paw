/* global gapi */

var _ = require('underscore');
var Backbone = require('backbone');
var UserModel = require('./UserModel.js');

var SessionModel = Backbone.Model.extend({
  defaults: {
    logged: false,
    userId: ''
  },

  initialize: function() {
    this.user = new UserModel({});
  },

  loginSessionUser: function(googleUser) {
    var profile = googleUser.getBasicProfile();
    this.updateSessionUser({
      id: googleUser.getAuthResponse().id_token,
      name: profile.getName(),
      email: profile.getEmail(),
      image: profile.getImageUrl()
    });
    this.set({ userId: this.user.get('id'), logged: true });
  },

  logoutSessionUser: function() {
    this.updateSessionUser(this.user.defaults);
    this.set({ userId: this.user.get('id'), logged: false });
  },

  updateSessionUser: function(userData) {
    this.user.set(_.pick(userData, _.keys(this.user.defaults)));
  },

  checkAuth: function(callback) {
    callback = callback || {};
    var auth2 = gapi.auth2.getAuthInstance();
    var userSignedIn = auth2.isSignedIn.get();
    var googleUser = auth2.currentUser.get();
    var profile = googleUser.getBasicProfile();

    console.log('auth2 is signed in: ', auth2.isSignedIn.get());

    if (userSignedIn && profile.getEmail().match(/^.*@isl.co$/g)) {
      this.loginSessionUser(googleUser);
      if ('success' in callback) {
        callback.success();
      }
    } else {
      this.logoutSessionUser();
      if ('error' in callback) {
        callback.error();
      }
    }

    console.log('session: ', this.attributes);
    console.log('user: ', this.user.attributes);

    if ('complete' in callback) {
      callback.complete();
    }
  }
});

module.exports = SessionModel;
