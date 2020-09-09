const Sauce = require ('../models/sauce');
const fs = require('fs');
const user = require ('../models/user');



exports.createSauce = (req, res, next) => {

  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;

  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));  
};


exports.modifySauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then( sauce => { 
    const filename = sauce.imageUrl.split('/images/')[1];

    fs.unlink(`images/${filename}`, () => {
      Sauce.deleteOne({ imageUrl: req.params.imageUrl })
      .then(() => res.status(200).json({ message: 'image supprimé !'}))
      .catch(error => res.status(400).json({ error }));
    });
  })
  .then( sauce => {
    const sauceObject = req.file ?
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    
      .then(() => res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(400).json({ error }));
  };



exports.getAllSauce = (req, res, next) => {
Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({ error }));
};



exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};



exports.likeSauce = (req, res, next) => {
  const likeClicked = req.body.like
  const userId = req.body.userId

  Sauce.findOne({ _id: req.params.id })
    .then (sauce => {
        if (likeClicked === 1){
            sauce.likes ++;
            sauce.usersLiked.push(userId);

            Sauce.updateOne({ _id: req.params.id }, { 'likes':sauce.likes, 'usersLiked':sauce.usersLiked, _id: req.params.id})
            .then (() => res.status(200).json({message:'like OK !'}))
            .catch(error => res.status(500).json({ 'ICI :':error }));
          
          res.status(200).json({message:'like validé !'})
        }
         else if (likeClicked === -1){
          sauce.dislikes ++;
          sauce.usersDisliked.push (userId);

          Sauce.updateOne({ _id: req.params.id }, { 'dislikes':sauce.dislikes, 'usersDisliked':sauce.usersDisliked, _id: req.params.id})
            .then (() => res.status(200).json({message:'dislike OK !'}))
            .catch(error => res.status(500).json({ 'ICI':error }));  
          
        res.status(200).json({message:'objet updated !'})  
        } else {

          if (sauce.usersLiked.includes(userId)){
            sauce.likes --;
              sauce.usersLiked = sauce.usersLiked.filter(function(Id){
                  return Id !== userId
              });

          } else if (sauce.usersDisliked.includes(userId)) {
            sauce.dislikes --;
            sauce.usersDisliked = sauce.usersDisliked.filter(function(Id){
              return Id !== userId
          });
          }
          
          Sauce.updateOne({ _id: req.params.id }, { 'likes':sauce.likes, 'dislikes': sauce.dislikes, 'usersLiked': sauce.usersLiked, 'usersDisliked': sauce.usersDisliked, _id: req.params.id})
        
          .then (() => res.status(200).json({message:'like or dislike remove !'}))
          .catch(error => res.status(500).json({ 'ICI :':error }));

        res.status(200).json({message:"sauce updated"})  
        }
    
  })
  .catch(error => res.status(500).json({'Oh non': error}));
} 
