var _ = require('underscore');
var Backbone = require('backbone');
var DogsCollection = require('../collections/DogsCollection');
var DashboardDogsListDogView = require('./DashboardDogsListDogView');

var DashboardDogsListView = Backbone.View.extend({
  initialize: function() {
    this.render = _.bind(this.render, this);
    this.renderDog = _.bind(this.renderDog, this);
    this.dogs = new DogsCollection();
    this.render();
    this.dogs.on('add', this.render);
  },

  render: function() {
    this.$el.html('');
    console.log(this.dogs.toJSON())
    // _.each(this.dogs, this.renderDog, this);
    this.dogs.each(this.renderDog);
    return this;
  },

  renderDog: function(dog) {
    this.$el.append((new DashboardDogsListDogView({
      tagname: 'li',
      model: dog
    })).$el);
  }
});

module.exports = DashboardDogsListView;
