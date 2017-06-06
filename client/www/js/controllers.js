angular.module('starter')
 
.controller('LoginCtrl', function($scope, AuthService, $ionicPopup, $state) {
  $scope.user = {
    name: '',
    password: ''
  };
 
  $scope.login = function() {
    AuthService.login($scope.user).then(function(msg) {
      $state.go('inside');
    }, function(errMsg) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: errMsg
      });
    });
  };
})
 
.controller('RegisterCtrl', function($scope, AuthService, $ionicPopup, $state) {
  $scope.user = {
    name: '',
    password: '',
    email: '',
    firstname: '',
    lastname: '',
    bod: '',
    gender: '',
  };
 
  $scope.signup = function() {
    AuthService.register($scope.user).then(function(msg) {
      AuthService.login($scope.user).then(function(msg) {
        $state.go('inside');
    })
      var alertPopup = $ionicPopup.alert({
        title: 'Register success!',
        template: msg
      });
    }, function(errMsg) {
      var alertPopup = $ionicPopup.alert({
        title: 'Register failed!',
        template: errMsg
      });
    });
  };
})
 
.controller('InsideCtrl', function($scope, AuthService, API_ENDPOINT, $http, $state) {
  $scope.destroySession = function() {
    AuthService.logout();
  };
 
  $scope.getInfo = function() {
    $http.get(API_ENDPOINT.url + '/memberinfo').then(function(result) {
      $scope.memberinfo = result.data.msg;
    });
  };
 
  $scope.logout = function() {
    AuthService.logout();
    $state.go('outside.login');
  };

  $scope.showProfilo = function(){
        $state.go('profile');
  };
  $scope.showGallery = function(){
        $state.go('gallery');
  };
  $scope.showScan = function(){
        $state.go('scan');
  };

})
 
.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('outside.login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });
})

.controller('ProfileCtrl',function($scope, AuthService, API_ENDPOINT, $http, $state, $ionicPopup) {
   $http.get('/pullProfile').then(success, error);

        function success(currentaccount){
        //success codec
            $scope.currentaccount = currentaccount.data;
        }
        function error(currentaccount){
        //error code
    	   console.error('Error: ' + currentaccount);

        }

  function Main($scope) {
  $scope.currentaccount.email;
  $scope.currentaccount.firstname;
  $scope.currentaccount.lastname;
  $scope.currentaccount.bod;
  $scope.currentaccount.gender;
  $scope.currentaccount.location;
  $scope.currentaccount.weight;
  $scope.currentaccount.height;
  $scope.currentaccount.eye;
  $scope.currentaccount.skin;
  $scope.currentaccount.small_nevi;
  $scope.currentaccount.large_nevi;
  $scope.currentaccount.sunbruns;
  $scope.currentaccount.risk;
}

 $scope.update = function () {
                $http.put('/pushProfile', {
                  location:($scope.currentaccount.location),
                  weight:($scope.currentaccount.weight),
                  height:($scope.currentaccount.height),
                  eye:($scope.currentaccount.eye),
                  skin:($scope.currentaccount.skin),
                  small_nevi:($scope.currentaccount.small_nevi),
                  large_nevi:($scope.currentaccount.large_nevi),
                  sunburns:($scope.currentaccount.sunburns),
                  risk:($scope.currentaccount.risk)
              })
                  .success(function (data, status, headers, config) {
                    $state.go('profile');
                    var alertPopup = $ionicPopup.alert({
                      title: 'Update success!',
                      template: 'update success'
                    });
                        })
                  .error(function (data, status) {
                    $state.go('editProfile');
                    var alertPopup = $ionicPopup.alert({
                      title: 'Update error!',
                      template: 'errore nei campi'
                    });
                  });
        }
 

  $scope.logout = function() {
    AuthService.logout();
    $state.go('outside.login');
  };
  $scope.showHome = function() {
    $state.go('inside');
  };

})

.controller('GalleryCtrl',function($scope, AuthService, $ionicPopup, $state,$http) {
     $http.get('/pullMole').then(success, error);

        function success(moles){
        //success codec
            $scope.moles = moles.data;
            console.log(moles)
        }
        function error(moles){
        //error code
    	   console.error('Error: ' + moles);
        }

  $scope.logout = function() {
    AuthService.logout();
    $state.go('outside.login');
  };

  $scope.showHome = function() {
    $state.go('inside');
  };

})

.controller('ScanCtrl',function($scope, AuthService, $ionicPopup, $state) {
   $scope.logout = function() {
    AuthService.logout();
    $state.go('outside.login');
  };

  $scope.showOldScan = function() {
    $state.go('oldScan');
  };
   $scope.showNewMole = function() {
    $state.go('newMole');
  };
   $scope.showHome = function() {
    $state.go('inside');
  };
})
.controller('NewMoleCtrl',function($scope, AuthService, $ionicPopup, $state,$http) {
  $scope.mole = {
    name: '',
    x: '',
    y: '',
    body_part: '',
    type: '',
  };
console.log($scope.mole);
  $scope.addMole = function () {
                $http.post('/pushMole', {
                  name:($scope.mole.name),
                  x:($scope.mole.x),
                  y:($scope.mole.y),
                  body_part:($scope.mole.body_part),
                  type:($scope.mole.type),
              })
                  .success(function (data, status, headers, config) {
                    $state.go('newScan');
                    var alertPopup = $ionicPopup.alert({
                      title: 'Mole add success!',
                      template: 'mole add success'
                    });
                        })
                  .error(function (data, status) {
                    $state.go('newMole');
                    var alertPopup = $ionicPopup.alert({
                      title: 'Update error!',
                      template: 'errore nei campi'
                    });
                  });
        }

    $scope.showHome = function() {
      $state.go('inside');
   };


})

.controller('NewScanCtrl',function($scope, AuthService, $ionicPopup, $state,$http) {
  $scope.scan = {
    filename: '',
    photo_uri: '',
    asymmetry: '',
    border: '',
    color: '',
    diamater:'',
    desc:'',
    itch:'',
    fire:'',
    puffy:'',
    pain:'',
  };
          $scope.addScan = function () {
                $http.post('/pushScan', {
                  filename:($scope.scan.filename),
                  photo_uri:($scope.scan.photo_uri),
                  asymmetry:($scope.scan.asymmetry),
                  border:($scope.scan.border),
                  color:($scope.scan.color),
                  diamater:($scope.scan.diamater),
                  desc:($scope.scan.desc),
                  itch:($scope.scan.itch),
                  fire:($scope.scan.fire),
                  puffy:($scope.scan.puffy),
                  pain:($scope.scan.pain),
              })

                  .success(function (data, status, headers, config) {
                    console.log($scope.scan)
                    $state.go('inside');
                    var alertPopup = $ionicPopup.alert({
                      title: 'scan add success!',
                      template: 'scan add success'
                    });
                        })
                  .error(function (data, status) {
                    $state.go('newScan');
                    var alertPopup = $ionicPopup.alert({
                      title: 'Update error!',
                      template: 'errore nei campi'
                    });
                  });
        }
        $scope.showHome = function() {
          $state.go('inside');
        };
})

.controller('OldScanCtrl',function($scope, AuthService, $ionicPopup, $state,$http) {
  $http.get('/pullScan').then(success, error);

        function success(scans){
        //success codec
            $scope.scans = scans.data;
            console.log(scans)
        }
        function error(scans){
        //error code
    	   console.error('Error: ' + scans);
        }

  $scope.logout = function() {
    AuthService.logout();
    $state.go('outside.login');
  };

  $scope.showHome = function() {
    $state.go('inside');
  };

 $scope.logout = function() {
    AuthService.logout();
    $state.go('outside.login');
  };
 $scope.showHome = function() {
    $state.go('inside');
  };
});