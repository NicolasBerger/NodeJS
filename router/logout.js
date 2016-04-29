var router = require('express').Router();
	
router.get('/',function (req, res) {
	req.session.destroy();
	res.render('logout');
});

module.exports = router;