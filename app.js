var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var logger = require('morgan');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');

mongoose.connect('mongodb://localhost/MyDatabase');
var app = express();
var router = express.Router();

app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(passport.initialize());
app.use(passport.session()); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// development only
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

var Schema = mongoose.Schema;

var UserDetail = new Schema({
    username: String,
    password: String
}, {collection: 'userInfo'});

var UserDetails = mongoose.model('userInfo',UserDetail);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   
    process.nextTick(function () {
	  UserDetails.findOne({'username':username},
		function(err, user) {
			if (err) { return done(err); }
			if (!user) { return done(null, false); }
			if (user.password != password) { return done(null, false); }
			return done(null, user);
		});
    });
  }
));

router.get('/auth', function(req, res, next) {
  res.sendFile('views/login.html', { root: __dirname });
});

router.get('/loginFailure' , function(req, res, next){
	res.send('Failure to authenticate');
});

router.get('/loginSuccess' , function(req, res, next){
	res.send('Successfully authenticated');
});

router.get('/login', function(req, res) {
  res.sendFile('views/login.html', { root: __dirname });
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/loginSuccess',
    failureRedirect: '/loginFailure'
  }));

app.use('/', router);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});