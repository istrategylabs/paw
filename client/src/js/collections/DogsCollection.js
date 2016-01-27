var Backbone = require('backbone');

var Dog = Backbone.Model.extend({
  defaults: {
    display_id: 0,
    name: '',
    checked_in: false,
    avatar: '',
    class: ''
  },
  idAttribute: 'display_id'
});

var Dogs = Backbone.Collection.extend({

  model: Dog,

  url: '/api/dogs',

  initialize: function() {
    this.fetch();
  }
});


module.exports = Dogs;
