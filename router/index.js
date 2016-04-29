var express = require('express');
var router = express.Router();
var Utilisateur = require('../schemas/schemas').Utilisateur;

var checkAuth = function(req, res, next) {
	nom = req.session.utilisateur;
	if(nom != undefined && nom != null && nom != ""){
		Utilisateur
			.findOne({nom : nom})
			.exec(function (err, utilisateur) {
				if (!err && utilisateur){
						return next();
				}else{
					if(err){
						console.log(err);
					}
					res.render('loginRedirect', {text:'Vous n\'êtes pas authentifié, redirection vers la page d\'authentification...'});
				}
			});
	}else{
		res.render('loginRedirect', {text:'Vous n\'êtes pas authentifié, redirection vers la page d\'authentification...'});
	}
};

router.use('/signin', require('./signin'));
router.use('/login', require('./login'));
router.use('/accueil', checkAuth, require('./accueil'));
router.use('/bibliotheque', checkAuth, require('./bibliotheque'));
router.use('/livres', checkAuth, require('./livres'));
router.use('/logout', checkAuth, require('./logout'));

module.exports = router;