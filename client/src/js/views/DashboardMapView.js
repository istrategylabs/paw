var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var DashboardMapViewTemplate = fs.readFileSync(__dirname + '/DashboardMapViewTemplate.html', 'utf8');

var DashboardMapView = Backbone.View.extend({
  template: _.template(DashboardMapViewTemplate),

  initialize: function() {
    this.render = _.bind(this.render, this);
    this.render();
    this.collection.on('add remove change', this.render);
  },

  render: function() {
    this.$el.html(this.template({
      dogs: this.collection.filter(function(dog) {
        return dog.get('checked_in');
      }).map(function(checkedInDog) {
        return checkedInDog.attributes;
      })
    }));
    return this;
  }
});

module.exports = DashboardMapView;
