const bcrypt = require ('bcrypt');
const User = require ('../models/user');
const jwt = require('jsonwebtoken');
const mongoSanitize = require('express-mongo-sanitize');
const MaskData = require('maskdata');

// parametres de masquage
const emailMask2Options = {
  maskWith: "*", 
  unmaskedStartCharactersBeforeAt: 2,
  unmaskedEndCharactersAfterAt: 257,
  maskAtTheRate: false
};



exports.signup = (req, res, next) => {
    // mot de passe doit contenir 8 caractères, 1 Majuscule, 1 chiffre et un caractère spécial sans espace 
    let validInput = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@${!%*?&])[A-Za-z\d@${!%*?&]{8,}$/;
    let password = req.body.password;

    // Sanitize password
    let sanitize = mongoSanitize.sanitize(password,
      {
      replaceWith: '_'
    });

    // masquage de l'email
    const email = req.body.email;
    const maskedEmail = MaskData.maskEmail2(email, emailMask2Options);

    if (validInput.test(password) === true){
    bcrypt.hash(sanitize, 10)
      .then(hash => {
        const user = new User({
          email: maskedEmail,
          password: hash
        });

        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })

      .catch(error => res.status(500).json({ error }));
    } else {
      res.status(500).json({message:"mot de passe doit contenir 8 caractères, 1 Majuscule, 1 chiffre et un caractère spécial sans espace"})  
    }
  };

  exports.login = (req, res, next) => {
    // masquage de l'email
    const email = req.body.email;
    const maskedEmail = MaskData.maskEmail2(email, emailMask2Options);

    User.findOne({ email: maskedEmail })
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            res.status(200).json({
              
              userId: user._id,
              token: jwt.sign(
                { userId: user._id },
                'veAceTgReHqPWoue',
                { expiresIn: '24h' }
              )
            });
          })
          .catch(error => res.status(500).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };
  
