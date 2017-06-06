///########################################################  Funzioni per l'admin
User=require('../models/account');
Scan=require('../models/scan');
Mole=require('../models/mole');
Doctor=require('../models/doctor');
Profile=require('../models/profile');

///######################################################## IMPORT PACKAGE NODE
var jwt= require('jwt-simple');
var logger = require("../config/logger");
/*
Inserire nel codice logger."livello"('MESSAGGIO');
I livelli sono :    error, warn, info, verbose, debug, silly
ogni livello contiene il livello precedente.
i livelli che verranno salvati sul file sono dichiarati nel file .env
es: logger.debug('debug info')
*/

///########################################################  Funzioni per la gestione della registrazione dei dottori
exports.addDoctor = function(req,res) {
    var token = getToken(req.headers);
    if (token) {
      var decoded = jwt.decode(token, process.env.SECRET);
      User.find({
        name:decoded.name
      }).exec(function (err, user){
        if (err) {
          return res.status(404).send({success: false, msg:'token non trovato'});
        }
        if (!user) {
          return res.status(404).send({success: false, msg:'Account admin' + decoded.name + 'non trovato.'});
        }
        var admin =decoded.role
        if (admin=='admin'){
          if (!req.body.password || !req.body.name || !req.body.email) {
            return res.status(400).send({success: false, msg: 'Nome,password ed email necessari.'});
          }else {
            var newUser = new User({
              name: req.body.name,
              password: req.body.password,
              role:'doctor',
              email:req.body.email
            });
            newUser.save(function(err) {
              if (err) {
                if(err.code==11000)
                //controllo su campi username or email duplicate
                return res.status(409).send({error:false, msg:'name o email già esistente'});
              }
            User.findOne({
              name: req.body.name
            },function(err, user) {
             if (err) throw err;
              if (!user) {
               res.status(404).send({success: false, msg: 'Account non trovato'});
              }else{
                var user_id=user._id;
                if (!req.body.firstname || !req.body.lastname || !req.body.city || !req.body.region || !req.body.phone  || !req.body.address) {
                  deleteAccount(user_id);
                  return res.status(400).send({success: false, msg: 'campi profilo necessari'});
                }else {
                  var newDoctor = new Doctor({
                    firstname:req.body.firstname,
                    lastname:req.body.lastname,
                    region:req.body.region,
                    city:req.body.city,
                    phone:req.body.phone,
                    address:req.body.address,
                    user_id:user_id,        
                  });         
                  newDoctor.save(function(err) {
                    if (err) {
                      deleteAccount(user_id);
                      return res.status(400).send({success:false, msg: 'Errore durante la creazione dell\'account dottore.'});}
                  })
                  res.status(201).send({success: true, msg: 'dottore creato!'});
                }
              }
            })
            })
          }
        }else {
          res.status(401).send({success:false, msg: 'autorizzazione amministratore necessaria'});
        }
      }
    )};
};                                                                    


///######################################################## ALTRE FUNZIONI UTILIZZATE

deleteAccount = function (user_id) {
    User.remove({
        _id : user_id
    }, function(err) {
        if (err)
        res.send(err);
			});
		}

getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
} 