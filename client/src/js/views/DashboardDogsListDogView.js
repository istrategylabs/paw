var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var DashboardDogsListDogViewTemplate = fs.readFileSync(__dirname + '/DashboardDogsListDogViewTemplate.html', 'utf8');

var DashboardDogsListDogView = Backbone.View.extend({
  template: _.template(DashboardDogsListDogViewTemplate),

  initialize: function() {
    this.render();
  },

  render: function() {
    console.log(this.model.toJSON());
    // this.$el.html(this.template(this.model));
    this.$el.html('asdfasfasdfs')
    return this;
  }
});

module.exports = DashboardDogsListDogView;
