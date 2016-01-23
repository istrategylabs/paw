var _ = require('underscore');
var Backbone = require('backbone');
var DashboardDogsListDogView = require('./DashboardDogsListDogView');

var DashboardDogsListView = Backbone.View.extend({
  initialize: function() {
    this.render = _.bind(this.render, this);
    this.renderDog = _.bind(this.renderDog, this);
    this.render();
    this.collection.on('add', this.render);
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
