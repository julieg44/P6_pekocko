const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const bouncer = require ('express-bouncer')(500, 90000, 2);
const userCtrl = require('../controllers/user');

const limit = rateLimit({
    max: 2,
    windowMs: 5* 60* 1000,
    message : " Vous avez effectué trop de tentatives, vous avez été bloqué. Rééssayez dans 5 minutes" 
});

// bouncer.blocked = function (req, res, next, remaining)
// {
//     res.send (429, "Too many requests have been made, " +
//         "please wait " + remaining / 1000 + " seconds");
// };

router.post('/signup',userCtrl.signup)
router.post('/login', limit, userCtrl.login);

module.exports = router;