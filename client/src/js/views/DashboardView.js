var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var app = require('../app');
var DashboardTemplate = fs.readFileSync(__dirname + '/DashboardTemplate.html', 'utf8');
var DashboardDogsListView = require('../views/DashboardDogsListView');

var DashboardView = Backbone.View.extend({
  template: _.template(DashboardTemplate),

  initialize: function() {
    this.render();
    console.log(this.$('ul'));
    this.$('ul').html((new DashboardDogsListView()).el);
    // new DashboardDogsListView({
    //   el: this.$('ul')
    // });
  },

  render: function() {
    this.$el.html(this.template({
      name: app.session.user.get('name')
    }));

    return this;
  }
});

module.exports = DashboardView;
