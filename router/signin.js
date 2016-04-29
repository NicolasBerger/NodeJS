var router = require('express').Router();
var Utilisateur = require('../schemas/schemas').Utilisateur;
	
router.get('/',function (req, res) {
	res.render('signin',{title:'Inscription'});
});

router.post('/',function (req, res) {
	Utilisateur.findOne({nom : req.body.nom}, function (err, utilisateur) {
		if (!err) {
			if(utilisateur){
				res.render('signin',{title:'Inscription', error:'Ce nom d\'utilisateur n\'est pas disponible'});;
			}else{
				new Utilisateur({
					nom: req.body.nom,
					mdp: req.body.mdp
				}).save();
				res.render('loginRedirect', {text:'Inscription réussie, vous allez être redirigé vers la page d\'authentification...'});
			}
		} else {
			console.error(err);
		}
	});
});

module.exports = router;