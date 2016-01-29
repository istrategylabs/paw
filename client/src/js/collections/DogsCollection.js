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

  comparator: function(a, b) {
    // sort by checked in
    if (a.get('checked_in') && !b.get('checked_in')) {
      return -1;
    }
    if (!a.get('checked_in') && b.get('checked_in')) {
      return 1;
    }

    // sorty by name
    var names = [a.get('name'), b.get('name')];
    names.sort();
    if (names[0] === a.get('name')) {
      return -1;
    }
    if (names[0] === b.get('name')) {
      return 1;
    }

    return 0;
  },

  url: '/api/dogs',

  initialize: function() {
    this.fetch();
  }
});


module.exports = Dogs;
