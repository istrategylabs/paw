var fs = require('fs');
var _ = require('underscore');
var $ = require('jquery');
var Backbone = require('backbone');
var DashboardMapTemplate = fs.readFileSync(__dirname + '/DashboardMapTemplate.html', 'utf8');

var DashboardMapView = Backbone.View.extend({
  template: _.template(DashboardMapTemplate),

  initialize: function() {
    this.render = _.bind(this.render, this);
    this.render();
    this.collection.on('add remove change', this.render);
  },

  arrangeDogsInCircle: function() {
    var $circles = this.$('.hydrant');
    $circles.each(function() {
      // http://codepen.io/dbpas/pen/LGudb
      var type = 1; //circle type - 1 whole, 0.5 half, 0.25 quarter
      var radius = '3em'; //distance from center
      var start = -180; //shift start from 0
      var $elements = $(this).find('li:not(:first-child)');
      var numberOfElements = (type === 1) ?  $elements.length : $elements.length - 1; //adj for even distro of elements when not full circle
      var slice = 360 * type / numberOfElements;

      // console.log($elements);

      $elements.each(function(index, elem) {
        var rotate = slice * index + start;
        var rotateReverse = rotate * -1;

        $(elem).css({
          'transform': 'rotate(' + rotate + 'deg) translate(' + radius + ') rotate(' + rotateReverse + 'deg)'
        });
      });
    });
  },

  render: function() {
    var checkedInDogs = this.collection.filter(function(dog) {
      return dog.get('checked_in');
    }).map(function(checkedInDog) {
      return checkedInDog.attributes;
    });

    this.$el.html(this.template({
      dogsByHydrant: _.groupBy(checkedInDogs, function(dog) {
        return dog.checked_in.hydrant;
      })
    }));

    // arrange dogs
    this.arrangeDogsInCircle();

    return this;
  }
});

module.exports = DashboardMapView;
