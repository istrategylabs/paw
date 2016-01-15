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

  updateSessionUser: function(userData) {
    this.user.set(_.pick(userData, _.keys(this.user.defaults)));
  },

  checkAuth: function(callback) {
    callback = callback || {};
    var auth2 = gapi.auth2.getAuthInstance();

    if (auth2.isSignedIn.get()) {
      var googleUser = auth2.currentUser.get();
      var profile = googleUser.getBasicProfile();
      if (profile.getEmail().match(/^.*@isl.co$/g)) {
        this.set({ userId: googleUser.getAuthResponse().id_token, logged: true });
        this.updateSessionUser({
          id: googleUser.getAuthResponse().id_token,
          name: profile.getName(),
          email: profile.getEmail(),
          image: profile.getImageUrl()
        });
        if('success' in callback) {
          callback.success();
        }
      }
    } else {
      this.set({ logged: false });
      if('error' in callback) {
        callback.error();
      }
    }

    if ('complete' in callback) {
      callback.complete();
    }

    console.log('session: ', this.attributes);
    console.log('user: ', this.user.attributes);
  }
});

module.exports = SessionModel;
