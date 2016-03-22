var config = require('./config');
var express = require('express');
var app = express();
var compression = require('compression');
var bodyParser = require('body-parser');

app.use(compression({ level: 9 }));
app.use(bodyParser.json());
app.set('port', config.get('PORT'));
app.use(express.static('public'));
require('./api/routes')(app);

app.use(function forceLiveDomain(req, res, next) {
  // Don't allow user to hit Heroku now that we have a domain, see http://is.gd/OmQ9Yp
  if (config.get('NODE_ENV') === 'production') {
    var host = req.hostname;
    if (host === 'paw-production.herokuapp.com') {
      return res.redirect(301, 'https://paw.isl.co/' + req.originalUrl);
    }
  }

  return next();
});

app.use(function redirectAllPaths(req, res, next) {
  // Redirect all paths to / to avoid 404's
  var originalUrl = req.originalUrl;
  if (originalUrl) {
    return res.redirect(301, '/');
  }
  return next();
});


var server = app.listen(app.get('port'), function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('paw-api listening at http://%s:%s', host, port);
});
