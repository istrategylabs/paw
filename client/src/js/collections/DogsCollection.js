var $ = require('jquery');
var Backbone = require('backbone');

var statusMap = {
  1: {
    color: 'green',
    name: 'in office'
  },

  2: {
    color: 'yellow',
    name: 'on a walk'
  },

  3: {
    color: 'red',
    name: 'missing'
  }
};

var Dog = Backbone.Model.extend({
  defaults: {
    display_id: 0,
    name: '',
    short_description: '',
    checked_in: false,
<<<<<<< HEAD
    avatar: '',
    current_status: 1,
    current_status_verbose: 'in office',
    current_status_color: 'green'
=======
    avatar: '' 
>>>>>>> 87409b94095d25734a5869ac31db47c902601d15
  },
  idAttribute: 'display_id',

  initialize: function () {
    this.setVerboseStatus();

    this.on('change:current_status', this.setVerboseStatus);
  },

  setVerboseStatus: function () {
    var statusOptions = statusMap[this.get('current_status')];

    this.set('current_status_verbose', statusOptions.name);
    this.set('current_status_color', statusOptions.color);
  },

  checkIn: function (data) {
    var that = this;

    return $.ajax({
      url: '/api/event',
      type: 'POST',
      dataType: 'json',
      data: {'events': [{ 
        'device': 'enim-sit-amet-elit', 
        'location': 'stellar-wind'}] 
      },
    })
    .done(function() {
      that.set('checked_in', true);
      console.log("CHECKED");
    })
    
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
