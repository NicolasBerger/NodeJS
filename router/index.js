var express = require('express');
var router = express.Router();

router.use('/login', require('./login'));
router.use('/accueil', require('./accueil'));
router.use('/bibliotheque', require('./bibliotheque'));
router.use('/livres', require('./livres'));

module.exports = router;