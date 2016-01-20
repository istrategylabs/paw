var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var app = require('../app');
var DashboardTemplate = fs.readFileSync(__dirname + '/DashboardTemplate.html', 'utf8');

var DashboardView = Backbone.View.extend({
  template: _.template(DashboardTemplate),

  render: function() {
    this.$el.html(this.template({
      name: app.session.user.get('name')
    }));

    return this;
  }
});

module.exports = DashboardView;
