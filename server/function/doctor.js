///########################################################  TUTTE LE FUNZIONI DESTINATE AI DOTTORI
User=require('../models/account');
Profile=require('../models/profile');
Doctor=require('../models/doctor');
Examination=require('../models/examination');
Scan=require('../models/scan');

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

///########################################################  VARIABILI UTILIZZATE NELLE FUNZIONI
var reportscan;

///######################################################## Funzione per la ricerca delle scansioni assegnate ai dottori
exports.doctorScan = function(req,res) {

    var token = getToken(req.headers);
        if (token) {
            var decoded = jwt.decode(token, process.env.SECRET);
            User.find({
                name:decoded.name
            }).exec(function (err, user){
                if (err) {
                    return res.status(401).send({success:false,msg:'token non valido'});
                }
                if (!user) {
                    return res.status(404).send({success:false,msg:'Account' + decoded.name + 'non trovato.'});
                }
                var doctor=decoded.role;
                if (doctor=='doctor'){
                    Scan.find({
                    doctor_id:decoded._id,
                    visitated:false
                }).exec(function (err, doc){
                    if (err) {
                        return res.status(400).send({success:false,msg:'errore durante la ricerca delle scansioni assegnate'});
                    }
                    if (doc.length == 0) {
                        return res.status(200).send({success:true,msg:'non hai scansioni assegnate'});
                    }
                    if(doc){
                        return res.status(200).send(doc);
                    }
                });
                }else {
                    return res.status(401).send({success:false,msg:'non sei un dottore!'});
                }
            });
		};
};

///########################################################  Funzione che permette ai dottori di commentare l'esaminazione.
exports.doctorComment = function(req,res) {

    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, process.env.SECRET);
            User.find({
                name:decoded.name
            }).exec(function (err, user){
                if (err) {
                    return res.status(401).send({success:false,msg:'token non valido'});
                }
                if (!user) {
                    return res.status(404).send({success:false,msg:'Account' + decoded.name + 'non trovato.'});
                }
                var doctor=decoded.role;
                if (doctor=='doctor'){
                    Scan.findOne({
                        name_mole:req.body.name_mole,
                        doctor_id:decoded._id
                    }).exec(function (err,doc){
                        if (err) {
                            return res.status(400).send({success:false,msg:'errore durante la ricerca della scansione'});
                        }
                        if (!doc) {
                           return res.status(404).send({success:false,msg:'Account ' + decoded.name + 'non trovato.'});
                        }
                        reportscan=doc;
                        var newExamination = new Examination({
                                doctor_id:reportscan.doctor_id,
                                scan_id:reportscan._id,
                                name_mole:reportscan.name_mole,
                                user_id:reportscan.user_id,
                                diagnosi:req.body.diagnosi,
                                completed:true,
                        });
                        newExamination.save(function(err,exa) {
                            if (err) {
                                if(err.code=="11000"){
                                    var time=new Date();
                                    Examination.findOneAndUpdate({
                                        scan_id:reportscan._id,
                                    },
                                    {
                                        $set:{
                                            diagnosi:req.body.diagnosi,
                                            data:time,
                                        }
                                    },{new: true},function(err,doc){
                                        if (err){
                                            return res.status(400).send({success:false,msg:'errore durante l\'aggiornamento dell\'esaminazione'});
                                        }
                                        return res.status(200).send(doc);
                                    })
                                }else 
                                    return res.status(400).send({success: false, msg:'errore durante la creazione dell\'esamionazione'});
                            } 
                            if(exa){  
                                Scan.findOneAndUpdate({
                                    scan_id:reportscan.scan_id,
                                },
                                {
                                    $set:{
                                        visitated:true
                                    }
                                },{new: true},function(err,doc){
                                    if (err){
                                        return res.status(400).send({success:false,msg:'errore durante la modifica del parametro visitiato delle scansioni'});
                                    }
                                    return res.status(201).send(exa);
                                })
                            } 
                        });
                    })
                 }else {
                    return res.status(401).send({success:false,msg:'non sei un dottore!'});
                }
            });
		};        
};
///########################################################  Funzione che permette ai dottori di cercare il profilo dei suoi pazienti

exports.doctorSearchProfile = function(req,res) {

    var token = getToken(req.headers);
        if (token) {
            var decoded = jwt.decode(token, process.env.SECRET);
            User.find({
                name:decoded.name
            }).exec(function (err, user){
                if (err) {
                    return res.status(401).send({success:false,msg:'token non valido'});
                }
                var doctor=decoded.role;
                if (doctor=='doctor'){
                    Mole.findOne({
                        name:req.body.name
                    }).exec(function (err,mole){
                        if (err) {
                            return res.status(400).send({success:false,msg:'errore durante la ricerca del neo'});
                        }
                        if (!mole) {
                           return res.status(404).send({success:false,msg:'neo ' + req.body.name + ' non trovato'});
                        }
                        Profile.findOne({
                            user_id:mole.user_id,
                        }).exec(function (err,profile){
                            if (err) {
                               return res.status(401).send({success:false,msg:'errore durante la ricerca del profilo del paziente'});
                            }
                            if (!profile) {
                                return res.status(404).send({success:false,msg:'profilo del paziente non trovato'});
                            }
                                return res.status(200).send(profile);
                        })
                    })
                }else {
                    return res.status(401).send({success:false,msg:'non sei un dottore!'});
                }
            });
		};
}




// ALTRE FUNZIONI UTILIZZATE 

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