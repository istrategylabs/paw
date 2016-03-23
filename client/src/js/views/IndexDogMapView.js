var fs = require('fs');
var _ = require('lodash');
var Backbone = require('backbone');
var $ = require('jquery');
var IndexDogMapTemplate = fs.readFileSync(__dirname + '/IndexDogMapTemplate.html', 'utf8');

function mapReached() {
  var viewport = window.innerHeight;
  var mapElem = document.getElementsByClassName('map__image')[0];
  var rect = mapElem.getBoundingClientRect();
  var top = rect.top;

  if (top - viewport < 0) {
    $(mapElem).addClass('is-active');
  }
}

var IndexDogMapView = Backbone.View.extend({
  template: _.template(IndexDogMapTemplate),

  initialize: function() {
    this.render = _.bind(this.render, this);
    this.collection.on('add update', this.render);

    // map animations
    $(window).on('scroll resize', _.throttle(mapReached, 100));
  },

  render: function() {
    var dogs = this.collection.models.filter(function(dog) {
      return !!(dog.get('avatar'));
    }).map(function(dog) {
      return dog.attributes;
    });

    this.$el.html(this.template({
      dogs: _.sampleSize(dogs, 3)
    }));

    return this;
  }
});

module.exports = IndexDogMapView;
