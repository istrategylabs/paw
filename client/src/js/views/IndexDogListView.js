var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var IndexDogListTemplate = fs.readFileSync(__dirname + '/IndexDogListTemplate.html', 'utf8');

var IndexDogListView = Backbone.View.extend({
  template: _.template(IndexDogListTemplate),

  initialize: function() {
    this.render = _.bind(this.render, this);
    this.collection.on('update', this.render);
    this.collection.each(function(dog) {
      dog.fetch();
    });
  },

  render: function() {
    console.log('render dog list')
    this.$el.html(this.template({
      dogs: this.collection.models.map(function(dog) {
        return dog.attributes;
      })
    }));
  }
});

module.exports = IndexDogListView;
