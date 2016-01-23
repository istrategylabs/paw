var Backbone = require('backbone');
var app = require('./app');
var LoginView = require('./views/LoginView');
var IndexView = require('./views/IndexView');
var DashboardView = require('./views/DashboardView');

var AppRouter = Backbone.Router.extend({
  routes: {
    '': 'index',
    'dashboard': 'dashboard'
  },

  initialize: function() {
    this.headerView = new LoginView({
      el: '#paw-app #header'
    });
  },

  execute: function(callback, args, name) {
    if (name !== 'index' && !app.session.get('logged')) {
      // authorization needed
      console.log('requested route change to ' + name + ' but not authed, force to index');
      app.router.navigate('/', { trigger: true, replace: true });
      return false;
    }

    if (callback) {
      callback.apply(this, args);
    }
  },

  index: function() {
    console.log('hit index');
    new IndexView({
      el: '#paw-app #main'
    });
  },

  dashboard: function() {
    console.log('hit dashboard');
    new DashboardView({
      el: '#paw-app #main'
    });
  }
});

module.exports = AppRouter;
