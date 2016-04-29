var router = require('express').Router();
var Utilisateur = require('../schemas/schemas').Utilisateur;
var Bibliotheque = require('../schemas/schemas').Bibliotheque;

router.get('/',function (req, res) {
	sess = req.session;
	Utilisateur
		.findOne({nom : sess.utilisateur})
		.exec(function (err, utilisateur) {
			if (!err) {
				if(utilisateur){
					res.render('accueil',{bibliotheques: utilisateur.bibliotheques});
				}else{
					console.error(err);
				}
			}
		});
});

router.post('/', function(req,res){
	var nomBibiliotheque = req.body.nom;
	sess = req.session;
	Utilisateur
		.findOne(
			{nom : sess.utilisateur}, 
			{bibliotheques: {$elemMatch: {nom: nomBibiliotheque}}}
		).exec(function (err, utilisateur) {
			if (!err) {
				if(utilisateur){
					if(utilisateur.bibliotheques.length == 0){
						var b = new Bibliotheque({
							nom: nomBibiliotheque
						});
						Utilisateur.update(
							{_id: utilisateur._id},
							{$push: {bibliotheques: b}},
							function(err){if(err) console.log(err)}
						);
					}
					res.redirect('/accueil');
				}else{
					res.render('login',{error:'Unknown user'});
				}
			}
		});
});

module.exports = router;