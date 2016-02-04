var Backbone = require('backbone');

var Dog = Backbone.Model.extend({
  defaults: {
    display_id: 0,
    name: '',
    short_description: '',
    checked_in: false,
    avatar: ''
  },
  idAttribute: 'display_id'
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
