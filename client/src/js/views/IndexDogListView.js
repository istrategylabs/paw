var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var Flickity = require('flickity-imagesloaded');
var IndexDogListTemplate = fs.readFileSync(__dirname + '/IndexDogListTemplate.html', 'utf8');

var IndexDogListView = Backbone.View.extend({
  template: _.template(IndexDogListTemplate),

  initialize: function() {
    this.render = _.bind(this.render, this);
    this.collection.on('add update', this.render);
  },

  render: function() {
    var dogs = this.collection.models.filter(function(dog) {
      return !!(dog.get('avatar'));
    }).map(function(dog) {
      return dog.attributes;
    });

    this.$el.html(this.template({
      dogs: _.shuffle(dogs)
    }));

    this.dogsSlider = new Flickity(this.el, {
      cellAlign: 'left',
      contain: true,
      imagesLoaded: true,
      percentPosition: true
    });
  }
});

module.exports = IndexDogListView;
