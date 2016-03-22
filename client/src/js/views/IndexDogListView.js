var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var Flickity = require('flickity-imagesloaded');
var IndexDogListTemplate = fs.readFileSync(__dirname + '/IndexDogListTemplate.html', 'utf8');

function assignFakeCheckins(dog) {
  var checkins;

  switch (dog.name) {
  case 'Barclay':
    checkins = 25;
    break;
  case 'Darwin':
    checkins = 3;
    break;
  case 'Ella':
    checkins = 5;
    break;
  case 'Gojo':
    checkins = 15;
    break;
  case 'Lilly':
    checkins = 1;
    break;
  case 'Petunia':
    checkins = 2;
    break;
  case 'Simon':
    checkins = 22;
    break;
  case 'Watson':
    checkins = 22;
    break;
  default:
    checkins = _.random(10, 100);
  }

  return _.assign(dog, { checkins: checkins });
}

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
    }).map(assignFakeCheckins);

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
