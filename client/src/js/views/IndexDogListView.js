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
    this.$el.html(this.template({
      dogs: this.collection.models.map(function(dog) {
        return dog.attributes;
      })
    }));

    this.dogsSlider = new Flickity(this.el, {
      cellAlign: 'left',
      contain: true,
      imagesLoaded: true
    });
  }
});

module.exports = IndexDogListView;
