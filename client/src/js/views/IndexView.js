var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var IndexTemplate = fs.readFileSync(__dirname + '/IndexTemplate.html', 'utf8');
var IndexDogListView = require('../views/IndexDogListView');
var IndexDogMapView = require('../views/IndexDogMapView');
var DogsCollection = require('../collections/DogsCollection');
var Jump = require('jump.js');
var $ = require('jquery');

var IndexView = Backbone.View.extend({
  template: _.template(IndexTemplate),

  events: {
    'click .jump-to-watch': 'handleJumpToWatch',
    'click .video__play': 'handleVideoPlay',
    'mousemove .video': 'handleVideoMousemove'
  },

  initialize: function() {
    this.handleVideoMousemove = _.throttle(this.handleVideoMousemove, 100);
    this.collection = new DogsCollection();
    this.render();

    this.dogList = new IndexDogListView({
      el: this.$('.dogs__list'),
      collection: this.collection
    });

    this.dogMap = new IndexDogMapView({
      el: this.$('.dogs__map'),
      collection: this.collection
    });
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  },

  handleJumpToWatch: function(e) {
    e.preventDefault();
    var jump = new Jump();
    jump.jump('#watch', { duration: 250 });
    $('.video__play').click();
  },

  handleVideoPlay: function(e) {
    e.preventDefault();
    var $videoEl = this.$('.video');
    var $videoMediaEl = this.$('video');
    if (!$videoMediaEl.attr('src')) {
      var videoSrc = Backbone.$(e.currentTarget).data('media');
      $videoMediaEl.attr('src', videoSrc);
    }

    $videoMediaEl[0].play();

    var self = this;
    $videoMediaEl[0].addEventListener('playing', function() {
      $videoEl.addClass('is-playing');
      $videoMediaEl.fadeIn();
      $videoEl.one('click', _.bind(self.handleVideoPause, self));
    });

    $videoMediaEl[0].addEventListener('pause', function() {
      $videoEl.removeClass('is-playing');
      $videoMediaEl.fadeOut();
    });
  },

  handleVideoPause: function(e) {
    e.preventDefault();
    var $videoPauseEl = this.$('.video__pause');
    var $videoMediaEl = this.$('video');
    $videoMediaEl[0].pause();
    $videoPauseEl.hide();
  },

  handleVideoMousemove: function() {
    var $videoPauseEl = this.$('.video__pause');
    var $videoMediaEl = this.$('video');
    if (this.mousemoveTimer) {
      clearTimeout(this.mousemoveTimer);
    }
    if (!$videoMediaEl[0].paused) {
      $videoPauseEl.fadeIn();
    }

    this.mousemoveTimer = setTimeout(function() {
      $videoPauseEl.fadeOut();
    }, 3000);
  }
});

module.exports = IndexView;
