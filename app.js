var express = require('express'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  errorHandler = require('errorhandler'),
  morgan = require('morgan'),
  http = require('http'),
  path = require('path');

var app = module.exports = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use(bodyParser());
app.use(methodOverride());    
app.use(express.static(path.join(__dirname, 'public')));

app.locals.apiLink = 'http://saig-api.herokuapp.com';

var env = process.env.NODE_ENV || 'development';

// development only
if (env === 'development') {
  app.use(errorHandler());
}

// production only
if (env === 'production') {
  // TODO
}

app.get('/', function(req,res){
    res.render('layout');
});

app.get('/partials/:name', function (req, res) {
	var name = req.params.name;
	res.render('partials/' + name);
});

app.get('/offline.appcache', function(req, res) {
	res.render('offline');
});

// redirect all others to the index (HTML5 history)
app.get('*', function(req,res){
    res.render('layout');
});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});