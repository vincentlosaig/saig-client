'use strict';

// Declare app level module which depends on filters, and services

var app = angular.module('auditApp', ['ngRoute', 'ui.bootstrap', 'auditApp.filters', 'auditApp.services', 'auditApp.directives'])
	.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
		$routeProvider.
			when('/', {
				templateUrl: 'partials/index',
				controller: 'MainController'
			}).
			when('/settings', {
				templateUrl: 'partials/settings',
				controller: 'MainController'
			}).
			otherwise({
				templateUrl: 'partials/error',
				controller: 'MainController'
			});
		
		$locationProvider.html5Mode(true);
		var original = $locationProvider.path;
		$locationProvider.path = function (path, reload) {
			if (reload === false) {
				var lastRoute = $route.current;
				var un = $rootScope.$on('$locationChangeSuccess', function () {
					$route.current = lastRoute;
					un();
				});
			}
			return original.apply($locationProvider, [path]);
		};
	}]);

app.run(function($window, $rootScope) {
	$rootScope.isOnline = navigator.onLine;
	$rootScope.requireUpdate = ($window.applicationCache.status == window.applicationCache.UPDATEREADY && $scope.isOnline);
	$rootScope.apiLink = "http://saig-api.herokuapp.com";
	//$rootScope.apiLink = "http://localhost:4000";
	
	$window.addEventListener("offline", function() {
		$rootScope.$apply(function() {
			$rootScope.isOnline = false;
			$rootScope.requireUpdate = false;
		});
	}, false);
	
	$window.addEventListener("online", function() {
		$rootScope.$apply(function() {
			$rootScope.isOnline = true;
			$rootScope.requireUpdate = ($window.applicationCache.status == window.applicationCache.UPDATEREADY && $scope.isOnline);			
		});
	}, false);
	
	if ($window.applicationCache) {
		$window.applicationCache.addEventListener("updateready", function(e) {
			if (!$rootScope.requireUpdate) {
				$rootScope.$apply(function() {
					$rootScope.requireUpdate = ($window.applicationCache.status == window.applicationCache.UPDATEREADY && $rootScope.isOnline);
					$rootScope.showLoading = false;
				});
			}
		}, false);		

		$window.applicationCache.addEventListener("checking", function(e) {
			if (!$rootScope.requireUpdate) {
				$rootScope.$apply(function() {	
					$rootScope.requireUpdate = ($window.applicationCache.status == window.applicationCache.UPDATEREADY && $rootScope.isOnline);		
					$rootScope.showLoading = true;
				});
			}				
		}, false);
		
		$window.applicationCache.addEventListener("noupdate", function(e) {
			if (!$rootScope.requireUpdate) {
				$rootScope.$apply(function() {
					$rootScope.requireUpdate = ($window.applicationCache.status == window.applicationCache.UPDATEREADY && $rootScope.isOnline);			
					$rootScope.showLoading = false;
				});
			}
		}, false);
	}
});