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

  execute: function(callback, args, name) {

    // execute will be called before the callback for each specific route
    // get the next route in here

    if (!this.headerView) {
      this.headerView = new LoginView({
        el: '#paw-app #header'
      });
    }

    if (name !== 'index' && !app.session.get('logged')) {
      // authorization needed
      console.log('requested route change to ' + name + ' but not authed, force to index');
      app.router.navigate('/', { trigger: true, replace: true });
      return false;
    }

    if(name == 'index' && app.session.get('logged')){

         // if user is logged in, don't allow them to go to the marketing index page
         // instead, force them to their dashboard
         console.log('requested route change to "' + name + '" but user is logged in, force to dashboard');
         app.router.navigate('dashboard', { trigger: true, replace: true });
         // else continue routing
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
