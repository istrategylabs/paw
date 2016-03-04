'use strict';

var TextRotator = require('/text-rotator');

$('.js-text-rotator').each(function() {
  var r = new TextRotator(this, {
    variableWidth: true,
    onComplete: function(){
      var self = this;
      var t = setTimeout(function() {
        self.$el.addClass('text-rotator--green-underline');
        clearTimeout(t);
      }, self.speed);
    }
  });
  r.init();
});