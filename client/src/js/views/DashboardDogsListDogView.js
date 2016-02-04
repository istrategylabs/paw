var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var DashboardDogsListDogTemplate = fs.readFileSync(__dirname + '/DashboardDogsListDogTemplate.html', 'utf8');

var DashboardDogsListDogView = Backbone.View.extend({
  template: _.template(DashboardDogsListDogTemplate),

  events: {
    'change [name="checked_in"]': 'handleCheckedInChange',
    'change [type="radio"]' : 'statusChange'
  },

  initialize: function() {
    this.render();
  },

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  },

  handleCheckedInChange: function(e) {
    this.model.set('checked_in', e.target.checked);
    this.render();
  },

  statusChange: function(e) {
    console.log('radio button has been changed');
  }
});

module.exports = DashboardDogsListDogView;
