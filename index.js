var express = require('express');
var session = require('express-session');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
//var connect = require('connect');
var methodOverride = require('method-override');

var sess;
var app = express();

app.set('views', './views');
app.set('view engine','jade');
app.use(methodOverride('_method'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extend: true}));
app.use(session({secret: 'ssshhhhh'}));
app.use(require('./router'));
app.use(express.static(__dirname + '/img'));

var server = app.listen(3000, function () {
    console.log('Serveur démarré');
	mongoose.connect('mongodb://localhost/test');
});

/*
var schemas = require('./schemas/schemas');
var Utilisateur = schemas.Utilisateur;
var Bibliotheque = schemas.Bibliotheque;
var Livre = schemas.Livre;

var root = new Utilisateur({
	nom: 'root',
	mdp: 'root'
});
var b1 = new Bibliotheque({
	nom: 'B1'
});
root.save();
Utilisateur.findOne({nom : root.nom}, function (err, utilisateur) {
	if (!err) {
		if(utilisateur){
			utilisateur.bibliotheques.push(b1);
			utilisateur.save();
		}else{
			res.render('login',{error:'Unknown user'});
		}
	} else {
		console.error(err);
	}
});
*/