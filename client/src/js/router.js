var Backbone = require('backbone');
// var app = require('./app');
var LoginView = require('./views/LoginView');

var AppRouter = Backbone.Router.extend({
  routes: {
    '': 'index',
    'dashboard': 'dashboard'
  },

  initialize: function() {
    this.headerView = new LoginView({});
    Backbone.$('#paw-app #header').html(this.headerView.render().$el);
  },

  index: function() {
    console.log('hit index');
  },

  dashboard: function() {
    console.log('hit dashboard');
  }
});

module.exports = AppRouter;
