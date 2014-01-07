
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
var appData = require('./ID.js');

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
		client_id: appData.AppID,
		redirect_uri: 'http://aryazeghbali.ir:3456/auth',
		scope: 'offline_access,user_photos'
	}));
});

app.get('/auth', function (req, res) {
  fb.getAccessToken(appData.AppID, appData.AppSecret, req.param('code'), 'http://aryazeghbali.ir:3456/auth', function (error, access_token, refresh_token) {
  	if(error) {
  		res.render('error', {error: error.data});
  	}
  	else {
  		req.session.access_token = access_token;
  		fb.apiCall('GET', '/me/profile', {access_token: req.session.access_token}, function (error, response, body) {
			if(body.data == null) {
				res.render('error', {error: "login first"});
			}
			else
			{
				var userID = body.data[0].id;
				db.pictures.findOne({id: userID}, function (err, data) {
					if(!err && data != null && data.lastPic >= data.pictures.length) {
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
			var userID = body.data[0].id;
			req.session.userID = userID;
			var pictures = [];
			fb.apiCall('GET', '/me/photos', {access_token: req.session.access_token, limit: 300}, function (error, response, bbody) {
				if(bbody == null)
					res.render('error', {error: "no picture!"});   		
		    	else {
			    	for(i in bbody.data) {
			    		var pic = bbody.data[i];
			    		var validTags = [];
			    		var users = [];
			    		for (var i = pic.tags.data.length - 1; i >= 0; i--) {
			    			if(pic.tags.data[i].id) {
			    				validTags.push(pic.tags.data[i]);
			    				users.push(pic.tags.data[i].id);
			    			}
			    		}
				    	if(validTags.length >= 3 && validTags.length <= 8) {
			    			pictures.push({picID: pic.id, users: users, pic: pic.source, width: pic.width, height: pic.height, tags: validTags, votes: []});
			    		}
			    	}
			    	console.log(pictures.length);
			    	function insert2db (n, err, callback) {
			    		if(n < 0)
			    			return callback(err);
			    		db.pictures.find({picID: pictures[n].picID}, function (err, data) {
			    			console.log("!!!!!!");
			    			console.log(err);
			    			console.log(data);
			    			console.log("@@@@@@");
			    			if (err || data.length == 0) {
			    				db.pictures.save(pictures[n], function (err2) {
			    					return insert2db(n-1, err2, callback);
			    				});
			    			}
			    			else {
			    				return insert2db(n-1, err, callback);
			    			}
			    		});
			    	}
			    	insert2db (pictures.length-1, null, function (err) {
			    		if(err){
			    			res.render('error', {error: err});
			    		}
			    		else{
			    			res.redirect('vote');
			    		}
			    	});
		    	}
			});
		}
  	});
});

app.get('/vote', function (req, res) {
	db.pictures.find({users: req.session.userID}, function (err, data) {
		// console.log(err);
		// console.log(data);
		if(err || data.length == 0) {
			res.render('error', {error: 'user not found'});
		}
		else {
			if(req.query.id){
				db.pictures.update({picID: req.query.id}, {$push: {votes: {userID: req.session.userID, vote: true}}}, function (err2, data2) {
					for (var i = data.length - 1; i >= 0; i--) {
						if(data[i].votes.indexOf({userID: req.session.userID}) == -1) {
							res.render('vote', {title: 'vote', picture: data[i]});
						}
					};
				});
			}
			else {
				console.log("no picID");
				console.log(data.length);
				for (var i = data.length - 1; i >= 0; i--) {
					if(data[i].votes.indexOf({userID: req.session.userID}) == -1) {
						res.render('vote', {title: 'vote', picture: data[i]});
					}
				};
			}
		}
	});
});

app.get(appData.resetURL, function (req, res) {
	db.pictures.drop(function (err) {
		res.redirect('/');
	});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
