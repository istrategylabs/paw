var fs = require('fs');
var _ = require('lodash');
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
    'click .jump-to-watch': 'onJumpToWatch',
    'click .video__play': 'onClickPlay'
  },

  initialize: function() {
    this.onVideoPlay = _.bind(this.onVideoPlay, this);
    this.onVideoPause = _.bind(this.onVideoPause, this);
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

    // Vimeo video
    var self = this;
    $.getScript('https://f.vimeocdn.com/js/froogaloop2.min.js').done(function() {
      var iframeEl = self.$el.find('#vimeo-player')[0];
      var player = $f(iframeEl);
      player.addEvent('ready', function() {
        player.addEvent('play', self.onVideoPlay);
        player.addEvent('pause', self.onVideoPause);
        player.addEvent('finish', self.onVideoPause);
      });

      self.player = player;
    });
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  },

  onJumpToWatch: function(e) {
    e.preventDefault();
    var jump = new Jump();
    // calculate offset to always scroll to center video horizontally
    var videoEl = this.$el.find('.video')[0];
    var rect = videoEl.getBoundingClientRect();
    var difference = rect.height - window.innerHeight;
    var offset = parseInt(difference / 2, 10);
    jump.jump('#watch', {
      duration: 250,
      offset: offset
    });
    this.player.api('play');
  },

  onClickPlay: function(e) {
    e.preventDefault();
    this.player.api('play');
  },

  onVideoPlay: function() {
    this.$el.find('.embed-poster, .video__play').fadeOut('fast');
  },

  onVideoPause: function() {
    this.$el.find('.embed-poster, .video__play').fadeIn('fast');
  }
});

module.exports = IndexView;
