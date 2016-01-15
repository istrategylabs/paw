var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var app = require('../app');
var LoginTemplate = fs.readFileSync(__dirname + '/LoginTemplate.html', 'utf8');
var LoggedTemplate = fs.readFileSync(__dirname + '/LoggedTemplate.html', 'utf8');

var LoginView = Backbone.View.extend({
  initialize: function() {
    app.session.on('change:logged', this.render);
  },

  render: function() {
    if (app.session.get('logged')) {
      console.log('logout rendered');
      this.template = _.template(LoggedTemplate);
    } else {
      console.log('login rendered');
      this.template = _.template(LoginTemplate);
    }

    console.log(this);
    this.$el.html(this.template({
      user: app.session.user.toJSON()
    }));

    return this;
  }
});

module.exports = LoginView;
