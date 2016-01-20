var Backbone = require('backbone');

var DogModel = Backbone.Model.extend({
  defaults: {
    id: 0,
    name: '',
    ownerName: '',
    birthday: '',
    foodRestrictions: 'None',
    description: '',
    likes: '', 
    dislikes: ''
  }
});

module.exports = DogModel;
