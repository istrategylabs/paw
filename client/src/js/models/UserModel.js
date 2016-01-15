var Backbone = require('backbone');

var UserModel = Backbone.Model.extend({
  defaults: {
    id: 0,
    name: '',
    email: '',
    image: ''
  }
});

module.exports = UserModel;
