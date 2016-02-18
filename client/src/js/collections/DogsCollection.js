var $ = require('jquery');
var Backbone = require('backbone');

var statusMap = {
  0: {
    color: 'green',
    label: 'in office'
  },

  1: {
    color: 'yellow',
    label: 'on a walk'
  },

  2: {
    color: 'red',
    label: 'missing'
  }
};

var Dog = Backbone.Model.extend({
  defaults: {
    display_id: 0,
    name: '',
    short_description: '',
    checked_in: false,
    avatar: '',
    current_status: 0
  },
  idAttribute: 'display_id',

  initialize: function () {
    this.on('change:current_status', this.setVerboseStatus);
  },

  setVerboseStatus: function () {

    // This function uses statusMap to get a label and color attribute and then returns those attributes as an array for Dog List View's render function.
    // There, we extend the dog model to have the added label and color attribute that are fed into our dog list template
    var statusOptions = statusMap[this.get('current_status')];
    return [statusOptions.label, statusOptions.color];

  },

  checkIn: function (data) {

    this.set('checked_in', true);
    this.set('current_status', 0);
    
  }
});

var Dogs = Backbone.Collection.extend({
  initialize: function() {
    this.on('add remove change', this.sort);
    this.fetch();
  },

  model: Dog,

  comparator: function(dog) {
    return [!dog.get('checked_in'), dog.get('name')];
  },

  url: '/api/dogs'
});


module.exports = Dogs;
