var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var DogsCollection = require('../collections/DogsCollection');
var DashboardTemplate = fs.readFileSync(__dirname + '/DashboardTemplate.html', 'utf8');
var DashboardDogsListView = require('../views/DashboardDogsListView');
var DashboardMapView = require('../views/DashboardMapView');

var DashboardView = Backbone.View.extend({
  template: _.template(DashboardTemplate),

  initialize: function() {
    this.render();
    this.collection = new DogsCollection();

    new DashboardDogsListView({
      el: this.$('.dashboard__dog-list'),
      collection: this.collection
    });

    new DashboardMapView({
      el: this.$('.dashboard__main'),
      collection: this.collection
    });
  },

  render: function() {
    var now = new Date();
    this.$el.html(this.template({
      date: _.take(_.drop(now.toString().split(' ')), 3).join(' ')
    }));
    return this;
  }
});

module.exports = DashboardView;
