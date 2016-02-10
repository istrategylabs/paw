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

    var verbose_status = this.model.setVerboseStatus();

    var rendered_obj =  _.extend({}, this.model.toJSON(), {
      current_status_label: verbose_status[0],
      current_status_color: verbose_status[1]
    });

    this.$el.html(this.template(rendered_obj));

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
    this.render();
    console.log('radio button has been changed');
  },

  toggleDropdown: function(e) {
    this.$el.find('.dropdown').toggleClass('dropdown--open');
    console.log('dropdown toggled');
  }
});

module.exports = DashboardDogsListDogView;
