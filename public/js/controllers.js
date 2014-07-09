'use strict';

function MainController($scope, $http, $rootScope) {
	$scope.responses = {};
	$scope.files = {};	
	
	$scope.setMessage = function (successMsg, failMsg) {
		if (successMsg == "") {
			$scope.failureMessage = failMsg;
			$scope.showSuccess = false;
			$scope.showFailure = true;			
		} else if (failMsg == "") {
			$scope.successMessage = successMsg;
			$scope.showSuccess = true;
			$scope.showFailure = false;			
		}
	};	
	
	if (typeof window.localStorage !== "undefined") {
		var loaded = false;
		
		if (localStorage.getItem("Responses") != null) {
			$scope.responses = JSON.parse(localStorage.getItem("Responses"));
			console.log("Responses: " + localStorage.getItem("Responses"));
			loaded = true;
		} 
		
		if (localStorage.getItem("Files") != null) {
			$scope.files = JSON.parse(localStorage.getItem("Files"));
			console.log("Files: " + localStorage.getItem("Files"));
			loaded = true;
		} 

		if (loaded) {
			$scope.setMessage("Loaded responses/files from cache", "");
		}
	}
	
	$scope.pageChanged = function() {
		if (typeof window.localStorage != "undefined") {
			localStorage.setItem("Page", $scope.currentPage);
			localStorage.setItem("Count", $scope.countPerPage);			
		}
		$scope.displayQuestions();
	};
	
	$scope.displayQuestions = function() {
		$scope.questions = $scope.allQuestions.slice((parseInt($scope.currentPage, 10) - 1) * parseInt($scope.countPerPage, 10), ((parseInt($scope.currentPage, 10) - 1) * parseInt($scope.countPerPage, 10)) + parseInt($scope.countPerPage, 10));
	};
	$http.jsonp($rootScope.apiLink + '/json/schemas.json?callback=JSON_CALLBACK');
			
	window.JSON_CALLBACK = function(data) {
		$scope.allQuestions = data['schema']['qms'].questions;
		$scope.currentPage = localStorage.getItem("Page") != null ? parseInt(localStorage.getItem("Page"), 10) : parseInt(1, 10);
		$scope.countPerPage = localStorage.getItem("Count") != null ? parseInt(localStorage.getItem("Count"), 10) : parseInt($scope.allQuestions.length, 10);		
		$scope.title = data['schema']['qms'].title;
		$scope.displayQuestions();
	};
	
	$scope.$watchCollection('responses', function(newVal, oldVal) {
		$scope.enableUpload = false;
		if (newVal !== oldVal) {
			$scope.saveAvailable = true;
			$scope.uploadAvailable = false;
		} 
	});
	
	$scope.upload = function(response, file) {
		$scope.setMessage("Uploaded", "");
		console.log("Uploading response: " + JSON.stringify(response));
		console.log("Uploading files: " + JSON.stringify(file));
		$scope.enableUpload = false;
		$scope.uploadAvailable = false;		
		localStorage.clear();
	};
	
	$scope.submit = function(response, file) {
		console.log("Saving response: " + JSON.stringify(response));
		console.log("Saving files: " + JSON.stringify(file));
		$scope.responses = angular.copy(response);		
		$scope.files = angular.copy(file);
		
		if (typeof window.localStorage !== "undefined") {
			$scope.setMessage("Saved", "");
			localStorage.setItem("Responses", JSON.stringify($scope.responses));
			localStorage.setItem("Files", JSON.stringify($scope.files));
			$scope.saveAvailable = false;
			$scope.enableUpload = true;
			$scope.uploadAvailable = true;
		}
	};	
	
	$scope.reload = function() {
		if ($rootScope.requireUpdate) {
			window.location.reload();
		}
	};
	
	// Check application cache status every 10 seconds
	setInterval(function(){
		if ($rootScope.isOnline) {
			if(!$rootScope.requireUpdate && window.applicationCache.status != window.applicationCache.UNCACHED) {
				window.applicationCache.update(); // Update the cache in background. Won't take effect until reload.				
			}
		}
	}, 2000);
}