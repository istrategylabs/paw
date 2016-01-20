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
    this.headerView = new LoginView({});
    Backbone.$('#paw-app #header').html(this.headerView.render().$el);
  },

  execute: function(callback, args, name) {
    if (this.currentView) {
      this.currentView.remove();
      this.currentView.unbind();
    }

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
    this.currentView = new IndexView({});
    Backbone.$('#paw-app #main').html(this.currentView.render().$el);
  },

  dashboard: function() {
    console.log('hit dashboard');
    this.currentView = new DashboardView({});
    Backbone.$('#paw-app #main').html(this.currentView.render().$el);
  }
});

module.exports = AppRouter;
