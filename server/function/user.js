// TUTTE LE FUNZIONI DESTINATE ALL UTENTE
///########################################################  SCHEMI MONGOOSE
User=require('../models/account');
Scan=require('../models/scan');
Mole=require('../models/mole');
Doctor=require('../models/doctor');
Profile=require('../models/profile');
Examination=require('../models/examination');
Photo=require('../models/foto');

///######################################################## IMPORT PACKAGE NODE
var jwt= require('jwt-simple');
var multer	=	require('multer');
var fs= require('fs');
var logger = require("../config/logger");

/*
Inserire nel codice logger."livello"('MESSAGGIO');
I livelli sono :    error, warn, info, verbose, debug, silly
ogni livello contiene il livello precedente.
i livelli che verranno salvati sul file sono dichiarati nel file .env
es: logger.debug('debug info')
*/

///########################################################  VARIABILI UTILIZZATE NELLE FUNZIONI
var mole; var doctor_id;var foto;

///########################################################  Funzioni per la gestione della registrazione

exports.addUser = function(req,res,next) {
  if (!req.body.password || !req.body.name || !req.body.email) {
    return res.status(400).send({success: false, msg: 'nome,password ed email richiesti.'});
  } else {
    logger.debug('Debugging info');
    var newUser = new User({
      name: req.body.name,
      password: req.body.password,
      email:req.body.email,
    });
    newUser.save(function(err) {
      if (err) {
        if(err.code==11000)
        //controllo su campi username or email duplicate
          return res.status(409).send({success:false, msg:'nome o email già esistente'});
        if(err.errors.email.path=='email'){
            return res.status(400).send({success:false, msg:'email non valida'});
        }
      }
      User.findOne({
        name: req.body.name
      },function(err, user) {
        if (err) throw err; ///####################### RIVEDERE
        if (!user) {
          res.status(404).send({success: false, msg: 'nome non trovato'});
        } else {
          var user_id=user._id;
          if (!req.body.firstname || !req.body.lastname || !req.body.bod || !req.body.gender) {
            deleteAccount(user_id);
            return res.status(400).send({success: false, msg: 'campi profilo necessari'});
          } else {
            var newProfile = new Profile({
              firstname:req.body.firstname,
              lastname:req.body.lastname,
              bod:req.body.bod,
              gender:req.body.gender,
              user_id:user_id,
            });
            if(req.body.gender!=="maschio" && req.body.gender!=="femmina"){
              deleteAccount(user_id);
              return res.status(400).send({success: false, msg: 'genere non corretto'});} 
            newProfile.save(function(err) {
              if (err) {
                // Controllo su campo data
                if(err.errors.bod.path=='bod')
                  deleteAccount(user_id);
                  return res.status(400).send({success: false, msg: 'data non corretta'});
              }
                res.status(201).send({success: true, msg: 'account creato con successo.'});
            });
          }
        }
      })
    });
  }
};




///########################################################  Funzioni per la gestione del login

exports.login = function(req,res) {

  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) 
        res.status(400).send({success: false, msg: 'errore durante il login,riprovare'}); 
    if (!user) {
      res.status(404).send({success: false, msg: 'Autenticazione fallita,account non trovato'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, process.env.SECRET);
          // return the information including token as JSON
          return res.status(200).send({success: true, token:'JWT ' + token});
        } else {
          return res.status(400).send({success: false, msg: 'Autenticazione fallita,password errata.'});
        }
      });
    }
  });
};


///########################################################  Funzioni per la gestione dei NEI E SCANSIONI ED ESAMINAZIONI

///######################################################## Save photo into a folder Server
exports.uploadPhoto=function(req,res){
    var token = getToken(req.headers);
        if (token) {
            var decoded = jwt.decode(token, process.env.SECRET);
            User.findOne({
                name:decoded.name,
                $or:[
                    {role:'admin'},
                    {role:'user'},
                    ]
            }).exec(function (err, currentaccount){
                if (err) 
                    return res.status(401).send({success:false,msg:'token non valido'});
                if (!currentaccount)
                   return res.status(401).send({success:false,msg:'non hai i permessi per questa operazione'});
                var storage	=	multer.diskStorage({
                    destination: function (req, file, callback) {
                        callback(null, './uploads');
                    },
                    filename: function (req, file, callback) {
                        callback(null, file.fieldname + '-' + Date.now());
                    }
                });
                var upload = multer({ storage : storage}).single('photoMole');
	                upload(req,res,function(err) {
		        if(err) {
                   return res.status(400).send({success:false,msg:'errore durante l\'upload del file'});
		        }
                    foto=req.file;
                   return res.status(201).send({success:true,msg:'file salvato'});

                })   
	        });
        };
}

//Salva il neo, necessario prima di pushScan
exports.pushMole = function(req,res) {  
    var token = getToken(req.headers);
        if (token) {
            var decoded = jwt.decode(token, process.env.SECRET);
            User.findOne({
                name:decoded.name
            }).exec(function (err, currentaccount){
                if (err) {
                    fs.unlink(foto.path, function(err) {
                        if (err) 
                            return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'});
                });
                    return res.status(401).send({success:false,msg:'token non valido'});
                }
                if (!currentaccount) {
                    fs.unlink(foto.path, function(err) {
                        if (err) 
                            return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'});
                    });
                   return res.status(404).send({success:false,msg:'account '+ decoded.name + ' non trovato'});
                }
                    var newMole = new Mole({
                        user_id:currentaccount._id,
                        x: req.body.x,
                        y:req.body.y,
                        name:req.body.name,
                        body_part:req.body.body_part,
                        type:req.body.type,
                        img:{
                            filename:foto.filename,
                            path:foto.path,
                            contentType:foto.mimetype,
                        }
                });
             // save the mole
                newMole.save(function(err,doc) {
                    if (err) {
                        if(err.code=="11000"){
                            fs.unlink(foto.path, function(err) {
                                if (err) 
                                    return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'});
                            });
                            return res.status(409).send({success: false, msg: 'Neo già esistente'});
                        } else
                            fs.unlink(foto.path, function(err) {
                                if (err) 
                                    return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'});
                            });
                            return res.status(400).send({success:false, msg:'errore durante il salvataggio del nero'});
                    }
                    mole=doc;
                    return res.status(200).send(doc);
                });
            });
		};
    }

///######################################################## Salva la scansione, dopo pushMole
exports.pushScan = function(req,res) {  
    Mole.findOne({
        name:mole.name
    }).exec(function (err, currentmole){
        if (err) {
            deleteMole(mole.name);
            fs.unlink(foto.path, function(err) {
                if (err) 
                  return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'})
            });
            return res.status(400).send({success:false,msg:'errore durante la ricerca del neo,ripetere le operazioni da capo.'});
        }
        if (!currentmole) {
            fs.unlink(foto.path, function(err) {
                if (err) 
                    return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'});
                });
            return res.status(404).send({success:false,msg:'neo '+ decoded.name + ' non trovato'});
        }       
        //PERMETTE L'assegnazione casuale del dottore.        
        Doctor.count().exec(function(err, count){
            var random = Math.floor(Math.random() * count);
            Doctor.findOne().skip(random).exec(
            function (err, result) {
                if (result){
                    doctor_id = result.user_id;
                     var newScan = new Scan({
                        user_id:currentmole.user_id,
                        mole_id:currentmole._id,
                        name_mole:currentmole.name,
                        date:currentmole.date,
                        doctor_id:doctor_id,
                        filename: foto.filename,
                        photo_uri:foto.path,
                        asymmetry:req.body.asymmetry,
                        border:req.body.border,
                        color:req.body.color,
                        diamater:req.body.diamater,
                        type:currentmole.type,
                        desc:req.body.desc,
                        body_part:currentmole.body_part,
                        itch:req.body.itch,
                        fire:req.body.fire,
                        puffy:req.body.puffy,
                        pain:req.body.pain,
                    });
                    // save the scan
                    newScan.save(function(err,doc) {
                        if (err) {
                            if(err.code=="11000"){
                                return res.status(409).send({success: false, msg: 'scansione già esistente'});
                            } else{
                                deleteMole(mole.name);
                                fs.unlink(foto.path, function(err) {
                                if (err) 
                                    return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'});
                            });
                                return res.status(400).send({success: false, msg:'errore durante il salvataggio della scansione,ripetere operazione da capo'});
                            }} 
                            if(doc){  
                                return res.status(201).send(doc);
                            } 
                    });
                    }else {
                        deleteMole(mole.name);
                        fs.unlink(foto.path, function(err) {
                                if (err) 
                                    return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'});
                            });
                        return res.status(400).send({success:false,msg:'errore durante l\'assegnazione del dottore'});
                    }
                }); 
            });
        });
	};






///######################################################## TUTTI I NEI DELL' UTENTE LOGGATO
exports.pullMole = function(req,res) { 
    var token = getToken(req.headers);
        if (token) {
            var decoded = jwt.decode(token, process.env.SECRET);
            var timestamp=req.body.date;
            Mole.find({
                user_id:decoded._id,
                date:{
                    $gt:timestamp,
                }
            }).exec(function (err, currentaccount){
                if (err) {
                    return res.status(401).send({success:false,msg:'errore durante la ricerca dei nei'});
                }
                if (!currentaccount) {
                    return res.status(404).send({success:false,msg:'nei di ' + decoded.name + ' non trovati.'});
                } 
                return res.status(200).send(currentaccount);
            });
		};
};
	

///######################################################## Tutte le scansioni dell'utente loggato
exports.pullScan = function(req,res) { 
    var token = getToken(req.headers);
        if (token) {
            var decoded = jwt.decode(token, process.env.SECRET);
            var timestamp=req.body.date;//QUESTA VARIABILE VA PRESA DAL CLIENT
            Scan.find({
                user_id:decoded._id,
                date:{
                    $gt:timestamp,
                }
            }).exec(function (err, doc){
                if (err) {
                    return res.status(401).send({success:false,msg:'errore durante la ricerca delle scansioni'});
                }
                if (!doc) {
                    return res.status(404).send({success:false,msg:'scansioni di ' + decoded.name + 'non trovate.'});
                }
                if(doc){
                    return res.status(200).send(doc);
                }

          });
       };
	};


///######################################################## FUNZIONI PER LA GESTIONE DEL PROFILO 

///######################################################## Richiedi profilo dell'utente loggato
exports.pullProfile = function(req,res) {

    var token = getToken(req.headers);
        if (token) {
            var decoded = jwt.decode(token, process.env.SECRET);
            Profile.find({
                user_id:decoded._id
            }).exec(function (err, currentaccount){
                if (err) {
                    return res.status(401).send({success:false,msg:'errore durante la ricerca del profilo'});
                }
                if (!currentaccount) {
                    return res.status(400).send({success:false,msg:'profilo di ' + decoded.name + 'non trovato.'});
                }
                return res.status(200).send(currentaccount);
            });
		};
};

///######################################################## prende i valori che l'utente vuole inserire ed aggiorna il profilo
exports.pushProfile = function(req,res) {
    
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, process.env.SECRET);
        Profile.findOneAndUpdate({
            user_id:decoded._id
        },
        {
            $set:{
                location:req.body.location,
                weight:req.body.weight,
                height:req.body.height,
                eye:req.body.eye,
                skin:req.body.skin,
                small_nevi:req.body.small_nevi,
                large_nevi:req.body.large_nevi,
                sunburns:req.body.sunburns,
                risk:req.body.risk,
                
        }},{new: true},function(err,doc){
                if (err){
                    return res.status(400).send({success:false,msg:'errore durante l\'aggiornamento del profilo'});
                }
            return res.status(200).send(doc);

        })
    }
}


///######################################################## restituisce i risultati dell'esaminazione dei nei
exports.getExaminationResult=function(req,res){

    var token = getToken(req.headers);
        if (token) {
            var decoded = jwt.decode(token, process.env.SECRET);
            Examination.find({
                user_id:decoded._id,
                completed:true,
            }).exec(function (err, examination){
                if (err) {
                    return res.status(401).send({success:false,msg:'errore durante la ricerca delle esaminazioni'});
                }
                if (!examination) {
                    return res.status(404).send({success:false,msg:'esaminazione non trovata'});
                }
                return res.status(200).send(examination);
            });
		};
};

///######################################################## restituisce i risultati dell'esaminazione dei nei
exports.deleteScan=function(req,res){

    var token = getToken(req.headers);
        if (token) {
            var decoded = jwt.decode(token, process.env.SECRET);
            Mole.findOne({
                name:req.body.name
            }).exec(function (err, currentmole){
                if (err) {
                    return res.status(401).send({success:false,msg:'errore durante la ricerca del neo,ripetere le operazioni da capo.'});
                }
                if (!currentmole) {
                    return res.status(404).send({success:false,msg:'neo '+ decoded.name + ' non trovato'});
                }     
                Scan.remove({
                    user_id:decoded._id,
                    name_mole:currentmole.name,
                }).exec(function (err, scan){
                    if (err) {
                        return res.status(400).send({success:false,msg:'errore durante la cancellazione della scansione'});
                    }
                    Mole.remove({
                        user_id:decoded._id,
                        name:currentmole.name
                    }).exec(function (err, scan){
                        if (err) {
                            return res.status(400).send({success:false,msg:'errore durante la cancellazione dell\'neo'});
                        }
                        Examination.remove({
                            user_id:decoded._id,
                            name_mole:currentmole.name
                        }).exec(function (err, scan){
                            if (err) {
                                return res.status(400).send({success:false,msg:'errore durante la cancellazione dell\'esaminazione'});
                            }
                            fs.unlink(currentmole.img.path, function(err) {
                                if (err) 
                                    return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'});
                                return res.status(200).send({success:true,msg:'scansione cancellata correttamente'});
                            });
                        });
                    });
                }); 
            });
    }
}







///######################################################## ALTRE FUNZIONI UTILIZZATE

deleteAccount = function (user_id) {
    User.remove({
        _id : user_id
    }, function(err) {
        if (err)
            res.status(400).send({success:false,msg:'errore durante la cancellazione dell\'account, contattare un amministratore'});
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

deleteMole = function (name) {
    Mole.remove({
        name : name
    }, function(err) {
        if (err)
            res.status(400).send({success:false,msg:'errore durante la cancellazione dell\'neo, contattare un amministratore'});
			});
}


///######################################################## ALTRE FUNZIONI NON USATE

/*
exports.ScanMole = function(req,res,next) {  
    var token = getToken(req.headers);
        if (token) {
            var decoded = jwt.decode(token, process.env.SECRET);
            User.findOne({
                name:decoded.name
            }).exec(function (err, currentaccount){
                if (err) {
                    fs.unlink(foto.path, function(err) {
                        if (err) 
                            return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'});
                });
                    return res.status(401).send({success:false,msg:'token non valido'});
                }
                if (!currentaccount) {
                    fs.unlink(foto.path, function(err) {
                        if (err) 
                            return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'});
                    });
                   return res.status(404).send({success:false,msg:'account '+ decoded.name + ' non trovato'});
                }
                    var newMole = new Mole({
                        user_id:currentaccount._id,
                        x: req.body.x,
                        y:req.body.y,
                        name:req.body.name,
                        body_part:req.body.body_part,
                        type:req.body.type,
                        img:{
                            filename:foto.filename,
                            path:foto.path,
                            contentType:foto.mimetype,
                        }
                });
             // save the mole
                newMole.save(function(err,doc) {
                    if (err) {
                        if(err.code=="11000"){
                            fs.unlink(foto.path, function(err) {
                                if (err) 
                                    return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'});
                            });
                            return res.status(409).send({success: false, msg: 'Neo già esistente'});
                        } else
                            fs.unlink(foto.path, function(err) {
                                if (err) 
                                    return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'});
                            });
                            return res.status(400).send({success:false, msg:'errore durante il salvataggio del nero'});
                    }
                    mole=doc;
                    Mole.findOne({
                        name:mole.name
                    }).exec(function (err, currentmole){
                        if (err) {
                            deleteMole(mole.name);
                            fs.unlink(foto.path, function(err) {
                                if (err) 
                                return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'})
                            });
                            return res.status(400).send({success:false,msg:'errore durante la ricerca del neo,ripetere le operazioni da capo.'});
                        }
                        if (!currentmole) {
                            fs.unlink(foto.path, function(err) {
                                if (err) 
                                    return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'});
                                });
                            return res.status(404).send({success:false,msg:'neo '+ decoded.name + ' non trovato'});
                        }       
                        //PERMETTE L'assegnazione casuale del dottore.        
                        Doctor.count().exec(function(err, count){
                            var random = Math.floor(Math.random() * count);
                            Doctor.findOne().skip(random).exec(
                            function (err, result) {
                                if (result){
                                    doctor_id = result.user_id;
                                    var newScan = new Scan({
                                        user_id:currentmole.user_id,
                                        mole_id:currentmole._id,
                                        name_mole:currentmole.name,
                                        date:currentmole.date,
                                        doctor_id:doctor_id,
                                        filename: foto.filename,
                                        photo_uri:foto.path,
                                        asymmetry:req.body.asymmetry,
                                        border:req.body.border,
                                        color:req.body.color,
                                        diamater:req.body.diamater,
                                        type:currentmole.type,
                                        desc:req.body.desc,
                                        body_part:currentmole.body_part,
                                        itch:req.body.itch,
                                        fire:req.body.fire,
                                        puffy:req.body.puffy,
                                        pain:req.body.pain,
                                    });
                                    // save the scan
                                    newScan.save(function(err,doc) {
                                        if (err) {
                                            if(err.code=="11000"){
                                                return res.status(409).send({success: false, msg: 'scansione già esistente'});
                                            } else{
                                                deleteMole(mole.name);
                                                fs.unlink(foto.path, function(err) {
                                                if (err) 
                                                    return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'});
                                            });
                                                return res.status(400).send({success: false, msg:'errore durante il salvataggio della scansione,ripetere operazione da capo'});
                                            }} 
                                            if(doc){  
                                                return res.status(201).send(doc);
                                            } 
                                    });
                                    }else {
                                        deleteMole(mole.name);
                                        fs.unlink(foto.path, function(err) {
                                                if (err) 
                                                    return res.status(400).send({success:false,msg:'errore durante la cancellazione della foto'});
                                            });
                                        return res.status(400).send({success:false,msg:'errore durante l\'assegnazione del dottore'});
                                    }
                                }); 
                            });
                        });
                });
            });
		};
    }
    */

    


///######################################################## Save photo in mongo DB collectionn

/*
exports.savephoto=function(req,res){
	upload(req,res,function(err) {
		if(err) {
			return res.end("Error uploading file.");
		}
        foto=req.file;
        var photo = new Photo;
        photo.img.filename = foto.filename;
        photo.img.data = fs.readFileSync(foto.path);
        photo.img.contentType = foto.mimetype;
        photo.save(function (err, img) {
            if (err){
                fs.unlink(foto.path, function(err) {
                    if (err) 
                        return console.error(err);
                    });
                throw err;
            } 
        fs.unlink(foto.path, function(err) {
        if (err) 
            return console.error(err);
        });
		res.end("File is uploaded");
	});
    })
}
*/


/*
///######################################################## restituisce l'email dell'utente loggato
exports.getEmail = function(req,res) {
    var token = getToken(req.headers);
        if (token) {
            var decoded = jwt.decode(token, process.env.SECRET);
            User.findOne({
                name:decoded.name
            }).exec(function (err, currentaccount){
                if (err) {
                    return res.status(400).send(err);
                }
                if (!currentaccount) {
                    return res.status(404).send('undefined');
                }
                return res.status(200).send("email: " + currentaccount.email);
            });
		};
} 
*/