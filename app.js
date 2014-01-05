
/**
 * Module dependencies.
 */

var mongojs = require('mongojs');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var fb = require('facebook-js');
var app = express();
var db = mongojs('WTBass', ['pictures']);

// all environments
app.set('port', process.env.PORT || 3456);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/start', function (req, res) {



	res.redirect(fb.getAuthorizeUrl({
		client_id: '259738020850947',
		redirect_uri: 'http://aryazeghbali.ir:3456/auth',
		scope: 'offline_access,user_photos'
	}));
});

app.get('/auth', function (req, res) {
  fb.getAccessToken('259738020850947', '95686212c9fd4b34b7b9ff3c79d085f7', req.param('code'), 'http://aryazeghbali.ir:3456/auth', function (error, access_token, refresh_token) {
  	if(error) {
  		res.render('error', {error: error.data});
  	}
  	else {
  		fb.apiCall('GET', '/me/profile', {access_token: req.session.access_token}, function (error, response, body) {
			if(body.data == null) {
				console.log(body);
				res.render('error', {error: "login first"});
			}
			else
			{
				var userID = body.data[0].id;
				db.pictures.findOne({id: userID}, function (err, data) {
					if( !err && data != null && data.lastPic >= data.pictures.length) {
						res.render('error', {error: 'You had been subscribed to this vote'});
					}
					else {
					  	req.session.access_token = access_token;
					    res.render('client', {title: 'Do you go?'});
					}
				});
			}
		});
	}
  });
});

app.get('/photo', function (req, res) {
	fb.apiCall('GET', '/me/profile', {access_token: req.session.access_token}, function (error, response, body) {
		if(body.data == null) {
			console.log(body);
			res.render('error', {error: "login first"});
		}
		else {
			//res.render('error', {error: body});
			//console.log(body);
			var userID = body.data[0].id;
			// console.log("Ajab: " + body.data.name + " " + body.data.id);
			req.session.userID = userID;
	  		fb.apiCall('GET', '/me/photos',
		    	{access_token: req.session.access_token},
			    function (error, response, bbody) {
			    	var pictures = [];
			    	for(i in bbody.data) {
			    		var pic = bbody.data[i];
			    		if(pic.tags.data.length >= 3 && pic.tags.data.length <= 8) {
			    			pictures.push({pic: pic.source, width: pic.width, height: pic.height, tags: pic.tags});
			    		}
			    	}
			    	db.pictures.save({id: userID, pictures: pictures, lastPic: 0}, function (err) {
			    		if(err) {
			    			res.render('error', {error: "could not save in DB"});
			    		}
			    		else {
			    			res.redirect('vote');
			    		}
			    	});
			    }
			);
  		}
  	});
});

app.get('/vote', function (req, res) {
	db.pictures.findOne({id: req.session.userID}, function (err, data) {
		if(err || data == null) {
			res.render('error', {error: 'user not found'});
		}
		else {
			db.pictures.update(data, {$inc: {lastPic: 1}}, function (err2, data2) {
				if(err2 || data == null) {
					res.render('error', {error: 'picture not found'});
				}
				else if( data.lastPic >= data.pictures.length){
					res.render('error', {error: 'pictures has been finished'});	
				}
				else{
					res.render('vote', {title: 'vote', picture: data.pictures[data.lastPic], me: data.id});
				}
			});
		}
	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
