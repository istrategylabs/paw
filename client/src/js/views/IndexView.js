var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var IndexTemplate = fs.readFileSync(__dirname + '/IndexTemplate.html', 'utf8');

var IndexView = Backbone.View.extend({
  template: _.template(IndexTemplate),

  initialize: function() {
    this.render();
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  }
});

module.exports = IndexView;
