var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var IndexDogListTemplate = fs.readFileSync(__dirname + '/IndexDogListTemplate.html', 'utf8');

var IndexDogListView = Backbone.View.extend({
  template: _.template(IndexDogListTemplate),

  initialize: function() {
    this.render = _.bind(this.render, this);
    this.collection.on('update', this.render);
    var self = this;
    this.collection.on('add', function(dog) {
      if (!dog.avatar) {
        dog.fetch({
          success: self.render
        });
      }
    });
  },

  render: function() {
    this.$el.html(this.template({
      dogs: this.collection.models.map(function(dog) {
        return dog.attributes;
      })
    }));
  }
});

module.exports = IndexDogListView;
