var env = process.env.NODE_ENV || 'development';
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var compression = require('compression');
var bodyParser = require('body-parser');

app.use(compression({ level: 9 }));
app.use(bodyParser.json());
app.set('port', port);
app.use(express.static('public'));


if (env === 'production') {
  app.use(function (req, res, next) {
    // force SSL on production
    // use req.headers.referrer !startsWith https
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
  });
}


var server = app.listen(app.get('port'), function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('paw-api listening at http://%s:%s', host, port);
});
