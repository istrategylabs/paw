/* global gapi */

var Backbone = require('backbone');
var app = require('./app');
var LoginView = require('./views/LoginView');

var AppRouter = Backbone.Router.extend({
  routes: {
    '*path': 'index'
  },

  execute: function(callback, args, name) {
    var self = this;
    app.session.checkAuth({
      success: function() {
        console.log('sign in user');
        // Backbone.$('#paw-app').html(self.currentView.render().$el);
      },
      error: function() {
        console.log('sign out user');
        self.navigate('/', { trigger: true, replace: true });
      }
    });

    if (callback) {
      callback.apply(this, args);
    }
  },

  index: function() {
    console.log('hit index');
    var loginView = new LoginView({});
    Backbone.$('#paw-app').html(loginView.render().$el);

    // TODO can this be moved to a better place?
    if (!app.session.get('logged')) {
      // render the signin button
      gapi.signin2.render('g-signin2');
    }
  }
});

module.exports = AppRouter;
