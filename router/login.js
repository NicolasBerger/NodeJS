var router = require('express').Router();
var Utilisateur = require('../schemas/schemas').Utilisateur;
	
router.get('/',function (req, res) {
	res.render('login',{title:'Login'});
});

router.post('/',function (req, res) {
	Utilisateur.findOne({nom : req.body.nom, mdp : req.body.mdp}, function (err, utilisateur) {
		if (!err) {
			if(utilisateur){
				sess=req.session;
				sess.utilisateur=utilisateur.nom;
				res.redirect('/accueil');
			}else{
				res.render('login',{error:'Unknown user'});
			}
		} else {
			console.error(err);
		}
	});
});

module.exports = router;