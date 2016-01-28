var Backbone = require('backbone');

var Dog = Backbone.Model.extend({
  defaults: {
    display_id: 0,
    name: '',
    checked_in: false,
    avatar: ''
  },
  idAttribute: 'display_id'
});

var Dogs = Backbone.Collection.extend({

  model: Dog,

  comparator: function(e) {
    return [e.get('checked_in'), e.get('name')];
  },

  updateCollectionOrder: function() {
    this.sort();
  },

  url: '/api/dogs',

  initialize: function() {
    this.fetch();
  }
});


module.exports = Dogs;
