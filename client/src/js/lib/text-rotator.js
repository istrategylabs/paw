'use strict';
var $ = require('jquery');

function TextRotator(el, options) {
  this.el = el;
  this.$el = $(el);
  this.$slide = this.$el.find('.text-rotator__slide');
  this.$items = this.$slide.find('.text-rotator__item');
  this.numItems = this.$items.length+1;
  this.interval = 1400 || options.interval;
  this.speed = 200 || options.speed;
  this.delay = 1200 || options.delay;
  this.ease = 'cubic-bezier(.54, 1.07, 0.46, 1.19)' || options.ease;
  this.variableWidth = false || options.variableWidth;
  this.increment = 100/this.numItems;
  this.distance = -100;
  this.index = 0;
  this.stepInterval = null;
  this.onComplete = options.onComplete;
}

TextRotator.prototype.init = function() {
  var self = this;
  var delayTimeout;
  var $firstItem = $(self.$items[self.numItems - 1]);
  this.$slide.css('transform', 'translateY(-100%)');
  this.$slide.css('transition', 'transform ' + this.speed + 'ms ' + this.ease);
  if(this.variableWidth) {
    this.$el.css('transition', 'width ' + this.speed/2 + 'ms ');
    this.$el.css('width', $firstItem.width() + 'px');
  }

  delayTimeout = setTimeout(function() {
    self.step();
    self.stepInterval = setInterval(function() {
      self.step();
    }, self.interval);
    clearTimeout(delayTimeout);
  }, self.delay);
};

TextRotator.prototype.step = function() {
  //have to reverse index them b/c translating down from the top
  var $currentItem = $(this.$items[(this.numItems - 1) - this.index]);
  var self = this;
  if (this.distance < 0) {
    this.distance += this.increment;

    this.$slide.css('transform', 'translateY('+ this.distance +'%)');
    if (this.variableWidth) {
      this.$el.css('width', $currentItem.width() + 'px');
    }
    this.index += 1;

    var removedItem = $currentItem;
    // $currentItem.remove();
    this.$slide.prepend(removedItem);
    if (this.distance === 0 && typeof this.onComplete === 'function') {
      this.onComplete();
    }
  } else {
    clearInterval(self.stepInterval);
  }
};

module.exports = TextRotator;