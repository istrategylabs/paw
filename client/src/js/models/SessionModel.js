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

    // Get attributes from user's gmail account and assign to
    // the current user in this session.
    this.updateSessionUser({
      id: googleUser.getAuthResponse().id_token,
      name: profile.getName(),
      email: profile.getEmail(),
      image: profile.getImageUrl()
    });

    // Set the SessionModel's values and show that a user is
    // now logged in.
    this.set({ userId: this.user.get('id'), logged: true });
  },

  logoutSessionUser: function() {

    // Clear and resets GoogleUser attributes to UserModel
    // default values.
    this.updateSessionUser(this.user.defaults);

    // Reset the SessionModel's values to defaults and show
    // that a user is now logged out.
    this.set({ userId: this.user.get('id'), logged: false });
  },

  updateSessionUser: function(userData) {

    // Data received from the authentication to be saved in the user model
    // is passed into this function.
    //
    // Select the data's default properties (_.pick its default
    //  _.keys) and set them using the values passed in from userData.
    //
    // In this instance, we are picking and updating id, name,
    // email, and image.
    this.user.set(_.pick(userData, _.keys(this.user.defaults)));
  },

  checkAuth: function(callback) {
    callback = callback || {};
    var auth2 = gapi.auth2.getAuthInstance();
    var userSignedIn = auth2.isSignedIn.get();
    var googleUser = auth2.currentUser.get();
    var profile = googleUser.getBasicProfile();

    console.log('auth2 is signed in: ', auth2.isSignedIn.get());

    // If a User is signed in and their gmail matches a @isl.co gmail,
    // log in this user.
    console.log();
    if (userSignedIn && googleUser.getHostedDomain().match(/^isl.co/g)) {
      this.loginSessionUser(googleUser);
      if ('success' in callback) {

        // If user is successfully signed in, call back a success function
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
