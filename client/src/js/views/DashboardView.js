var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var app = require('../app');
var DashboardTemplate = fs.readFileSync(__dirname + '/DashboardTemplate.html', 'utf8');
var Dogs = require('../collections/DogsCollection');

var DashboardView = Backbone.View.extend({
  template: _.template(DashboardTemplate),

  initialize: function() {
    this.dogs = new Dogs();
  },

  render: function() {
    this.$el.html(this.template({
      name: app.session.user.get('name'),
      dogs: this.dogs.toJSON()
    }));

    return this;
  }
});

module.exports = DashboardView;
