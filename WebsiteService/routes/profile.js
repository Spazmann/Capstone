const express = require('express');
const router = express.Router();

router.get('/', async function(req, res) {
    res.render('profile', { title: "Home Page", });
});

module.exports = router;