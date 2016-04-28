var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var livre = new Schema({
	isbn :{type: String, required: true},
    titre: {type: String, required: true},
	auteur: {type: String, required: false},
	url: {type: String, required: false},
    dateCreation: {type: Date, default: Date.now}
});

var bibliotheque = new Schema({
    nom: {type: String, required: true},
    livres: [livre],
    dateCreation: {type: Date, default: Date.now}
});

var utilisateur = new Schema({
    nom: {type: String, required: true},
    prenom: {type: String, required: false},
    email: {type: String, required: false},
    mdp: {type: String, required: true},
	bibliotheques: [bibliotheque],
    dateCreation: {type: Date, default: Date.now}
});

var Utilisateur = mongoose.model('Utilisateur', utilisateur, 'utilisateurs');
var Bibliotheque = mongoose.model('Bibliotheque', bibliotheque, 'bibliotheques');
var Livre = mongoose.model('Livres', livre, 'livres');

exports.Livre = Livre;
exports.Bibliotheque = Bibliotheque;
exports.Utilisateur = Utilisateur;