const express = require('express');
const router = express.Router();
const bouncer = require ('express-bouncer')(18000, 90000, 5);
const userCtrl = require('../controllers/user');


// Bloque l'utilisateur au bout de 5 tentatives échouées
bouncer.blocked = function (req, res, next)
{
    res.send (429, "Too many requests have been made, " +
        "please wait " + 3 + " minutes");
};

router.post('/signup', userCtrl.signup)
router.post('/login',bouncer.block, userCtrl.login);

module.exports = router;