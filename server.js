var express = require('express.io');
var mongojs = require('mongojs');
var bodyParser = require('body-parser');

var serverIp = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var serverPort = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var dbUri = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/sinapse';

var db = mongojs(dbUri, ['requests']);

var server = express();
server.http().io();
server.use(bodyParser());
server.use('/', express.static(__dirname + '/'));

server.get('/requests', function(req, res){
	//console.log('Retrieving all requests'); 
	db.requests.find(function (err, items) {
		res.send(items);
	});
});

server.get('/requests/:id', function(req, res){
    //console.log('Retrieving request: ' + req.params.id);    
	db.requests.findOne( { _id : mongojs.ObjectId(req.params.id ) } , function(err, item) {
		res.send(item);
	});    
});

server.post('/requests', function(req,res){
    var request = req.body;
    console.log('Adding request: ' + JSON.stringify(request));
	db.requests.insert(request, {safe:true}, function(err, result) {
		if (err) {
			res.send({'error':'An error has occurred'});
		} else {
			console.log('Success: ' + JSON.stringify(result));
			server.io.broadcast("newRequest", result);
			res.send(result);
		}
	});
});

server.listen(serverPort, serverIp, function () {
    console.log("Sinapse Server started @ " + serverIp + ":" + serverPort);
});

