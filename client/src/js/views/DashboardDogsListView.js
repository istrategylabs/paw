var _ = require('underscore');
var Backbone = require('backbone');
var DashboardDogsListDogView = require('./DashboardDogsListDogView');

var DashboardDogsListView = Backbone.View.extend({
  initialize: function() {
    this.render = _.bind(this.render, this);
    this.renderDog = _.bind(this.renderDog, this);
    this.render();

    var self = this;
    this.collection.on('change', function() {
      // This seems to do the trick; this might get expensive though
      // lets say we ever have 3000 dogs
      self.collection.sort();
      self.render();
    });
    this.collection.on('add', function(dog) {
      if (!dog.avatar || !dog.owner) {
        dog.fetch({
          success: self.render
        });
      }
    });
  },

  render: function() {
    this.$el.html('');
    this.collection.each(this.renderDog);
    return this;
  },

  renderDog: function(dog) {
    this.$el.append((new DashboardDogsListDogView({
      tagName: 'li',
      model: dog
    })).el);
  }
});

module.exports = DashboardDogsListView;
