var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var DashboardDogsListDogTemplate = fs.readFileSync(__dirname + '/DashboardDogsListDogTemplate.html', 'utf8');

var DashboardDogsListDogView = Backbone.View.extend({
  template: _.template(DashboardDogsListDogTemplate),

  events: {
    'click .button--check-in': 'handleCheckedInChange',
    'change [type="radio"]' : 'statusChange',
    'click .dropdown' : 'toggleDropdown'
  },

  initialize: function() {
    this.render();
  },
 
  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  },

  handleCheckedInChange: function(e) {
    this.model.set('checked_in');
    this.render();
    console.log('dog checked in');
  },

  statusChange: function(e) {
    this.toggleDropdown();
    console.log('radio button has been changed');
  },

  toggleDropdown: function(e) {
    this.$el.find('.dropdown').toggleClass('dropdown--open');
    console.log('dropdown toggled');
  }
});

module.exports = DashboardDogsListDogView;
