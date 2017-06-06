//create a new express router
const   express= require('express'),
        router=express.Router(),
        userController=require('./function/user');
        doctorController=require('./function/doctor');
        adminController=require('./function/admin');
var     passport= require('passport');



require('./config/passport')(passport);

module.exports = router;

//define routes

// ROUTE FOR USER

//router for account 
router.post('/signup',userController.addUser);
router.post('/login', userController.login);

//route for profile  
router.get('/pullProfile',passport.authenticate('jwt', { session: false}), userController.pullProfile);
router.put('/pushProfile',passport.authenticate('jwt', { session: false}), userController.pushProfile);

//route for scan 
router.post('/pushScan',passport.authenticate('jwt', { session: false}), userController.pushScan);
router.post('/pushMole',passport.authenticate('jwt', { session: false}), userController.pushMole);
router.post('/pullScan',passport.authenticate('jwt', { session: false}),  userController.pullScan);
router.post('/pullMole',passport.authenticate('jwt', { session: false}),  userController.pullMole);
router.post('/deleteScan',passport.authenticate('jwt', { session: false}),  userController.deleteScan);

//upload photo
 router.post('/uploadPhoto',passport.authenticate('jwt', { session: false}),userController.uploadPhoto);

// ROUTE FOR EXAMINATION USER
router.get('/getExaminationResult',passport.authenticate('jwt', { session: false}),  userController.getExaminationResult);


//Route for Doctors
//GET DOCOTR SCAN
router.get('/doctorScan',passport.authenticate('jwt', { session: false}), doctorController.doctorScan);
router.post('/doctorComment',passport.authenticate('jwt', { session: false}), doctorController.doctorComment);
router.post('/doctorSearchProfile',passport.authenticate('jwt', { session: false}), doctorController.doctorSearchProfile);

//Route for Admin
router.post('/signupDoctor', adminController.addDoctor);



// ALTRE ROUTE 

//THIS ROUTE IS USED TO SAVE PHOTO'S INTO MONGO DB COLLECTION
//router.post('/savePhoto',passport.authenticate('jwt', { session: false}), userController.savephoto);

//router.post('/ScanMole',passport.authenticate('jwt', { session: false}), userController.ScanMole);
//router.get('/GetEmail',passport.authenticate('jwt', { session: false}),    userController.getEmail);

