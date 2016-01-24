var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var IndexTemplate = fs.readFileSync(__dirname + '/IndexTemplate.html', 'utf8');
var IndexDogListView = require('../views/IndexDogListView');
var DogsCollection = require('../collections/DogsCollection');

var IndexView = Backbone.View.extend({
  template: _.template(IndexTemplate),

  initialize: function() {
    this.render();
    this.collection = new DogsCollection();

    new IndexDogListView({
      el: this.$('.dogs__list'),
      collection: this.collection
    });
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  }
});

module.exports = IndexView;
