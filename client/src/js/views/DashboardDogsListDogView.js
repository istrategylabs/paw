var fs = require('fs');
var _ = require('underscore');
var $ = require('jquery');
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
    this.listenTo(this.model, 'change:current_status', this.render);
  },
 
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },

  handleCheckedInChange: function(e) {
    this.model.checkIn();
    this.render();
    console.log('dog checked in');
  },

  statusChange: function(e) {
    var val = $(e.target).val();
    this.model.set('current_status', val);
    this.toggleDropdown();
    console.log('radio button has been changed');
  },

  toggleDropdown: function(e) {
    this.$el.find('.dropdown').toggleClass('dropdown--open');
    console.log('dropdown toggled');
  }
});

module.exports = DashboardDogsListDogView;
