/* global gapi */

var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var app = require('../app');
var LoginTemplate = fs.readFileSync(__dirname + '/LoginTemplate.html', 'utf8');
var LoggedTemplate = fs.readFileSync(__dirname + '/LoggedTemplate.html', 'utf8');

var LoginView = Backbone.View.extend({
  initialize: function() {
    this.render = _.bind(this.render, this);
    this.render();
    app.session.on('change:logged', this.render);
  },

  events: {
    'click #auth2-signin': 'handleLogin',
    'click #auth2-signout': 'handleLogout'
  },

  render: function() {
    if (app.session.get('logged')) {
      console.log('logout rendered');
      this.template = _.template(LoggedTemplate);
    } else {
      console.log('login rendered');
      this.template = _.template(LoginTemplate);
    }

    this.$el.html(this.template({
      user: JSON.stringify(app.session.user.toJSON())
    }));

    return this;
  },

  handleLogin: function() {
    var auth2 = gapi.auth2.getAuthInstance();
    console.log('called login')
    auth2.signIn();
  },

  handleLogout: function() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut();
  }
});

module.exports = LoginView;
