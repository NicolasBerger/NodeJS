var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var livre = new Schema({
	isbn :{type: String, required: true},
    titre: {type: String, required: true},
	auteur: {type: String, required: false},
	url: {type: String, required: false},
	url_image: {type: String, required: false},
    dateCreation: {type: String, default: getDate()}
});

var bibliotheque = new Schema({
    nom: {type: String, required: true},
    livres: [livre],
    dateCreation: {type: String, default: getDate()}
});

var utilisateur = new Schema({
    nom: {type: String, required: true},
    prenom: {type: String, required: false},
    email: {type: String, required: false},
    mdp: {type: String, required: true},
	bibliotheques: [bibliotheque],
    dateCreation: {type: String, default: getDate()}
});

var Utilisateur = mongoose.model('Utilisateur', utilisateur, 'utilisateurs');
var Bibliotheque = mongoose.model('Bibliotheque', bibliotheque, 'bibliotheques');
var Livre = mongoose.model('Livres', livre, 'livres');

exports.Livre = Livre;
exports.Bibliotheque = Bibliotheque;
exports.Utilisateur = Utilisateur;


function getDate(){
	var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 
    return dd+'/'+mm+'/'+yyyy;
}