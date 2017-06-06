// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])
 
.config(function($stateProvider, $urlRouterProvider) {
 
  $stateProvider
  .state('outside', {
    url: '/outside',
    abstract: true,
    templateUrl: 'templates/outside.html'
  })
  .state('outside.login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  .state('outside.register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'RegisterCtrl'
  })
  .state('inside', {
    url: '/inside',
    templateUrl: 'templates/inside.html',
    controller: 'InsideCtrl'
  })
  .state('profile',{
    url:'/profile',
    templateUrl:'templates/profile.html',
    controller:'ProfileCtrl'
  })

  .state('gallery',{
    url:'/gallery',
    templateUrl:'templates/gallery.html',
    controller:'GalleryCtrl'
  })
  .state('scan',{
    url:'/scan',
    templateUrl:'templates/scan.html',
    controller:'ScanCtrl'
  })
 .state('oldScan',{
    url:'/oldScan',
    templateUrl: 'templates/cronoscan.html',
    controller:'OldScanCtrl'
  })
  .state('newMole',{
    url:'/newMole',
    templateUrl:'templates/nuovomole.html',
    controller:'NewMoleCtrl'
  })
  .state('newScan',{
    url:'/newScan',
    templateUrl:'templates/nuovascan.html',
    controller:'NewScanCtrl'
  });



  $urlRouterProvider.otherwise('/inside');
})
 
.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {
    if (!AuthService.isAuthenticated()) {
      console.log(next.name);
      if (next.name !== 'outside.login' && next.name !== 'outside.register') {
        event.preventDefault();
        $state.go('outside.login');
      }
    }
  });
});