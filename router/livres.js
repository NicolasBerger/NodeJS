var router = require('express').Router();
var Utilisateur = require('../schemas/schemas').Utilisateur;
var Bibliotheque = require('../schemas/schemas').Bibliotheque;

router.get('/', function(req, res){
	sess = req.session;
	Utilisateur
		.findOne({nom : sess.utilisateur})
		.exec(function (err, utilisateur) {
			if (!err) {
				if(utilisateur){
					console.log(utilisateur.bibliotheques);
					res.render('livres',{
						bibliotheques: utilisateur.bibliotheques, 
						breadcrumb: ['livres']
					});
				}else{
					console.log(err);
				}
			}
		});
});

router.put('/:isbn/:ancienneB/:nouvelleB', function(req,res){
	var isbn = req.params.isbn;
	var ancienneBibliotheque = req.params.ancienneB;
	var nouvelleBibliotheque = req.params.nouvelleB;
	var livre;
	sess = req.session;
	Utilisateur
		.findOne({nom: sess.utilisateur})
		.exec(function (err, utilisateur){
			if(!err){
				if(utilisateur){
					var livres;
					var trouve = false;
					for(var i=0;i<utilisateur.bibliotheques.length;i++){
						if (utilisateur.bibliotheques[i].nom == nouvelleBibliotheque){
							trouve = true;
						}
					}
					if(!trouve){
						var b = new Bibliotheque({
							nom: nouvelleBibliotheque
						});
						Utilisateur.update(
							{_id: utilisateur._id},
							{$push: {bibliotheques: b}},
							function(err){if(err) console.log(err)}
						);
					}
					for(var i=0;i<utilisateur.bibliotheques.length;i++){
						if (utilisateur.bibliotheques[i].nom == ancienneBibliotheque){
							livres = utilisateur.bibliotheques[i].livres;
							for(var j=0;j<livres.length;j++){
								if (livres[j].isbn == isbn){
									livre = livres[j];
									livres.splice(j,1);
									i = utilisateur.bibliotheques.length;
									break
								}
							}
						}
					}
					if(livres && livre){
						Utilisateur.update(
							{_id: utilisateur._id, 'bibliotheques.nom': ancienneBibliotheque},
							{$set: {'bibliotheques.$.livres': livres}},
							function(err){if(err) console.log(err)}
						);
						Utilisateur.update(
							{_id: utilisateur._id, 'bibliotheques.nom': nouvelleBibliotheque},
							{$push: {'bibliotheques.$.livres': livre}},
							function(err){if(err) console.log(err)}
						);
						res.redirect('back');
					}else{
						console.log('Erreur');
					}
				}
			}else{
				console.log(err);
			}
		})
});

module.exports = router;