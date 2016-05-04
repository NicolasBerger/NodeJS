var router = require('express').Router();
var http = require('http');
var https = require('https');
var Utilisateur = require('../schemas/schemas').Utilisateur;
var Livre = require('../schemas/schemas').Livre;
var sjcl = require('sjcl');
var parseString = require('xml2js').parseString;

var AWS = function(accessKeyId, secretAccessKey, associateTag){
   var self = this;

	self.itemLookup = function(itemId, req, res){
		var attributes, url_image, item_url;
		var itemPromise = new Promise(function(resolve, reject) {
			var params = [];
			params.push({name: "Service", value: "AWSECommerceService"});
			params.push({name: "AWSAccessKeyId", value: accessKeyId});
			params.push({name: "AssociateTag", value: associateTag});
			params.push({name: "Operation", value: "ItemLookup"});
			params.push({name: "Timestamp", value: formattedTimestamp()});
			params.push({name: "ItemId", value: itemId});
			params.push({name: "ResponseGroup", value: "ItemAttributes"});

			var signature = computeSignature(params, secretAccessKey);
			params.push({name: "Signature", value: signature});
			var queryString = createQueryString(params);
			var url = "https://webservices.amazon.com/onca/xml?"+queryString;    
			
			https.get(url, function(response) {
				var body = '';
				response.on('data', function(d) {
					body += d;
				});
				response.on('end', function() {
					parseString(body, 
						function(err, result) {
							var parsed = JSON.parse(JSON.stringify(result));
							console.log(result);
							if(parsed && parsed['ItemLookupResponse']['Items'][0] && parsed['ItemLookupResponse']['Items'][0]['Item'][0]['ASIN'][0] == itemId){
								attributes = parsed['ItemLookupResponse']['Items'][0]['Item'][0]['ItemAttributes'][0];
								item_url = parsed['ItemLookupResponse']['Items'][0]['Item'][0]['DetailPageURL'][0];
								resolve();
							}
						}
					)
				});
			});
		});
		var imagePromise = new Promise(function(resolve, reject) {
			var params = [];
			params.push({name: "Service", value: "AWSECommerceService"});
			params.push({name: "AWSAccessKeyId", value: accessKeyId});
			params.push({name: "AssociateTag", value: associateTag});
			params.push({name: "Operation", value: "ItemLookup"});
			params.push({name: "Timestamp", value: formattedTimestamp()});
			params.push({name: "ItemId", value: itemId});
			params.push({name: "ResponseGroup", value: "Images"});

			var signature = computeSignature(params, secretAccessKey);
			params.push({name: "Signature", value: signature});
			var queryString = createQueryString(params);
			var url = "https://webservices.amazon.com/onca/xml?"+queryString;    
			
			https.get(url, function(response) {
				var body = '';
				response.on('data', function(d) {
					body += d;
				});
				response.on('end', function() {
					parseString(body, 
						function(err, result) {
							var parsed = JSON.parse(JSON.stringify(result));
							if(parsed && parsed['ItemLookupResponse']['Items'][0] && parsed['ItemLookupResponse']['Items'][0]['Item'][0]['ASIN'][0] == itemId){
								url_image = parsed['ItemLookupResponse']['Items'][0]['Item'][0]['LargeImage'][0]['URL'][0];
								resolve();
							}
						}
					)
				});
			});
		});		
		
		Promise
			.all([itemPromise, imagePromise])
			.then(function() {
				sess = req.session;
				var nomBibliotheque = req.params.nom;
				var isbnLivre = req.body.isbn;
				Utilisateur
					.findOne(
						{nom : sess.utilisateur}, 
						{bibliotheques: {$elemMatch: {nom: nomBibliotheque}}}
					).exec(function (err, utilisateur) {
						if (!err) {
							if(utilisateur){
								if(utilisateur.bibliotheques[0] !== undefined){
									var livres = utilisateur.bibliotheques[0].livres;
									for(var i=0;i<livres.length;i++){
										if(livres[i].isbn == isbnLivre){
											res.render('bibliotheque',{
												bibliotheque: utilisateur.bibliotheques[0], 
												breadcrumb: ['bibliotheque'], 
												context: [nomBibliotheque],
												error: 'Vous possédez déjà ce livre'});
											return;
										}
									}
									var livre = new Livre({
										isbn: isbnLivre,
										titre: attributes.Title[0],
										auteur: attributes.Author[0],
										url: item_url,
										url_image: url_image
									});
									Utilisateur.update(
										{_id: utilisateur._id, 'bibliotheques.nom': nomBibliotheque},
										{$push: {'bibliotheques.$.livres': livre}},
										function(err){if(err) console.log(err)}
									);
									console.log('Livre enregistré');
								}
								res.redirect('back');
							}
						}else{
							console.log(err);
						}
					});
			}, function() {
			  console.log('Probleme lors des promesses');
			});
	}
};

function formattedTimestamp(){
      var now = new Date();

      var year = now.getUTCFullYear();

      var month = now.getUTCMonth()+1; // otherwise gives 0..11 instead of 1..12
      if (month < 10) { month = '0' + month; } // leading 0 if needed

      var day = now.getUTCDate();
      if (day < 10) { day = '0' + day; }

      var hour = now.getUTCHours();
      if (hour < 10) { hour = '0' + hour; }

      var minute = now.getUTCMinutes();
      if (minute < 10) { minute = '0' + minute; }

      var second = now.getUTCSeconds();
      if (second < 10) { second = '0' + second; }

      return year+'-'+month+'-'+day+'T'+hour+':'+minute+':'+second+'Z';
   }

function createQueryString(params){
      var queryPart = [];
      var i;

      params.sort(byNameField);

      for(i=0; i<params.length; i++){
         queryPart.push(encodeURIComponent(params[i].name) +
                        '=' +
                        encodeURIComponent(params[i].value));
      }

      return queryPart.join("&");

      function byNameField(a, b){
         if (a.name < b.name) { return -1; }
         if (a.name > b.name) { return 1; }
         return 0;
      }
   }

function computeSignature(params, secretAccessKey){

  var stringToSign = 'GET\nwebservices.amazon.com\n/onca/xml\n' + createQueryString(params);
  var key = sjcl.codec.utf8String.toBits(secretAccessKey);
  var hmac = new sjcl.misc.hmac(key, sjcl.hash.sha256);
  var signature = hmac.encrypt(stringToSign);
  signature = sjcl.codec.base64.fromBits(signature);

  return signature;
}

router.get('/:nom', function(req, res){
	sess = req.session;
	var nomBibliotheque = req.params.nom;
	Utilisateur
		.findOne(
			{nom : sess.utilisateur}, 
			{bibliotheques: {$elemMatch: {nom: nomBibliotheque}}}
		).exec(function (err, utilisateur) {
			if (!err) {
				if(utilisateur){
					res.render('bibliotheque',{
						bibliotheque: utilisateur.bibliotheques[0], 
						breadcrumb: ['bibliotheque'], 
						context: [nomBibliotheque]
					});
				}else{
					console.log(err);
				}
			}
		});
});

router.post('/:nom', function(req,res){
	var aws = new AWS('AKIAJEHSLN54UJILBP2A','URao6e7ZHKLTgL9FDfSU4aJ5evszfqtS17lpPXGY',"gestionbi-21");
	aws.itemLookup(req.body.isbn, req, res);
});

router.delete('/:nom', function(req,res){
	var nomBibliotheque = req.params.nom;
	sess = req.session;
	Utilisateur
		.findOne(
			{nom: sess.utilisateur},
			{bibliotheques: {$elemMatch: {nomBibliotheque}}}
		).exec(function (err, utilisateur){
			if(!err){
				if(utilisateur){
					Utilisateur.update(
						{_id: utilisateur._id},
						{$pull: {bibliotheques: {nom: nomBibliotheque}}},
						function(err){if(err) console.log(err)}
					);
					res.redirect('back');
				}
			}else{
				console.log(err);
			}
		})
});

router.put('/:ancienNom/:nouveauNom', function(req,res){
	var nomBibliotheque = req.params.ancienNom;
	var nouveauNom = req.params.nouveauNom;
	sess = req.session;
	Utilisateur
		.findOne(
			{nom: sess.utilisateur},
			{bibliotheques: {$elemMatch: {nomBibliotheque}}}
		).exec(function (err, utilisateur){
			if(!err){
				if(utilisateur){
					Utilisateur.update(
						{_id: utilisateur._id, 'bibliotheques.nom': nomBibliotheque},
						{$set: {'bibliotheques.$.nom': nouveauNom}},
						function(err){if(err) console.log(err)}
					);
					res.redirect('back');
				}
			}else{
				console.log(err);
			}
		})
});

router.get('/:nom/livre/:isbn', function(req,res){
	var nomBibliotheque = req.params.nom;
	var isbnLivre = req.params.isbn;
	sess = req.session;
	Utilisateur
		.findOne(
			{nom : sess.utilisateur}, 
			{bibliotheques: {$elemMatch: {nom: nomBibliotheque}}}
		).exec(function (err, utilisateur) {
			if (!err) {
				if(utilisateur){
					if(utilisateur.bibliotheques[0] !== undefined){
						var livres = utilisateur.bibliotheques[0].livres;
						for(var i=0;i<livres.length;i++){
							if(livres[i].isbn == isbnLivre){							
								res.render('livre',{
									livre: utilisateur.bibliotheques[0].livres[i], 
									bibliotheque : utilisateur.bibliotheques[0].nom,
									breadcrumb: ['bibliotheque', 'livre'], 
									context: [nomBibliotheque,isbnLivre]
								});
								return;
							}
						}
						res.redirect('back');			
					}else{
						console.log('Livre non trouvé');
						res.redirect('back');
					}
				}else{
					console.log(err);
				}
			}
		});
});

router.delete('/:nom/livre/:isbn', function(req,res){
	var nomBibliotheque = req.params.nom;
	var isbnLivre = req.params.isbn;
	sess = req.session;
	Utilisateur
		.findOne(
			{nom : sess.utilisateur}, 
			{bibliotheques: {$elemMatch: {nom: nomBibliotheque}}}
		).exec(function (err, utilisateur) {
			if (!err) {
				if(utilisateur){
					if(utilisateur.bibliotheques[0] !== undefined){						
						var livres = utilisateur.bibliotheques[0].livres;
						for(var i=0;i<livres.length;i++){
							if(livres[i].isbn == req.params.isbn){	
								livres.splice(i,1);
								Utilisateur.update(
									{_id: utilisateur._id, 'bibliotheques.nom': nomBibliotheque},
									{$set: {'bibliotheques.$.livres': livres}},
									function(err){if(err) console.log(err)}
								);								
								res.redirect('/bibliotheque/'+nomBibliotheque);
								return;
							}
						}
					}
				}
			}else{
				console.log(err);
			}
		});
});

module.exports = router;