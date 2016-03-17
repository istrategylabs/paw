var fs = require('fs');
var _ = require('underscore');
var $ = require('jquery');
var ErrorTemplate = fs.readFileSync(__dirname + '/views/ErrorTemplate.html', 'utf8');

var app = {};

app.error = function(message) {
  var template = _.template(ErrorTemplate);
  template = template({
    message: message
  });
  $(template).hide().appendTo('#paw-app #messages').slideDown(function() {
    var self = this;
    setTimeout(function() {
      $(self).slideUp(function() {
        $(this).remove();
      });
    }, process.env.ERROR_DISPLAY_TIMEOUT_MS);
  });
};

app.clearErrors = function() {
  $('#paw-app #messages').children().slideUp(function() {
    $(this).remove();
  });
};

module.exports = app;
