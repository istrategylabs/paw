var fs = require('fs');
var _ = require('underscore');
var Backbone = require('backbone');
var app = require('../app');
var DogsCollection = require('../collections/DogsCollection');
var DashboardTemplate = fs.readFileSync(__dirname + '/DashboardTemplate.html', 'utf8');
var DashboardDogsListView = require('../views/DashboardDogsListView');

var DashboardView = Backbone.View.extend({
  template: _.template(DashboardTemplate),

  initialize: function() {
    this.render();
    this.collection = new DogsCollection();

    console.log('[DashboardView] About to print out dog');
    console.log(this.collection[0]);

    // console.log('---', this.collection.pluck('model.display_id'));

    new DashboardDogsListView({
      el: this.$('ul'),
      collection: this.collection
    });
  },

  render: function() {
    this.$el.html(this.template({
      name: app.session.user.get('name')
    }));

    return this;
  }
});

module.exports = DashboardView;
