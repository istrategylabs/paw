var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var DashboardMapTemplate = fs.readFileSync(__dirname + '/DashboardMapTemplate.html', 'utf8');

var DashboardMapView = Backbone.View.extend({
  template: _.template(DashboardMapTemplate),

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
