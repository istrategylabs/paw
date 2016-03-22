var config = require('./config');
var express = require('express');
var app = express();
var compression = require('compression');
var bodyParser = require('body-parser');

app.use(compression({ level: 9 }));
app.use(bodyParser.json());
app.set('port', config.get('PORT'));
app.use(express.static('public'), {
  maxAge: config.get('CACHE_CONTROL_MAX_AGE')
});
require('./api/routes')(app);

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
