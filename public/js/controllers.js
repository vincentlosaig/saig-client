'use strict';

function MainController($scope, $http, $rootScope, $filter) {
	$scope.responses = {};
	$scope.files = {};	
	$scope.allQuestions = [];
	$scope.sections = [];
	$scope.questions = [];
	$scope.schemaView = 'Questions';
	
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
		
		if (localStorage.getItem("SchemaView") !== null) {
			$scope.schemaView = localStorage.getItem("SchemaView");
			console.log("SchemaView: " + $scope.schemaView);
		} else {
			$scope.schemaView = 'Questions';
		}
		
		if (localStorage.getItem("Responses") !== null) {
			$scope.responses = JSON.parse(localStorage.getItem("Responses"));
			console.log("Responses: " + localStorage.getItem("Responses"));
			loaded = true;
		} 
		
		if (localStorage.getItem("Files") !== null) {
			$scope.files = JSON.parse(localStorage.getItem("Files"));
			console.log("Files: " + localStorage.getItem("Files"));
			loaded = true;
		} 

		if (loaded) {
			$scope.setMessage("Loaded responses/files from cache", "");
		}
	}
	
	$scope.changePage = function(direction) {
		console.log(direction);
		switch (direction) {
			case -1: 
				if (currentPage > 1) currentPage--;
				break;
			case 1:
				if (currentPage < (($scope.schemaView == 'Questions') ? ($scope.allQuestions.length / $scope.countPerPage) : ($scope.sections.length))) currentPage++;
				break;
		}
	};
	
	$scope.pageChanged = function() {
		if (typeof window.localStorage != "undefined") {
			localStorage.setItem("Page", $scope.currentPage);
			localStorage.setItem("Count", $scope.countPerPage);			
		}
		$scope.displayQuestions();
	};
	
	$scope.displayQuestions = function() {
		switch ($scope.schemaView) {
			case "Questions":
				$scope.questions = $scope.allQuestions.slice((parseInt($scope.currentPage, 10) - 1) * parseInt($scope.countPerPage, 10), ((parseInt($scope.currentPage, 10) - 1) * parseInt($scope.countPerPage, 10)) + parseInt($scope.countPerPage, 10));
				break;
			case "Sections":
				$scope.questions = [];
				$scope.allQuestions.forEach(function(q) {
					if (q.section.id == $scope.currentPage) {
						$scope.questions.push(q);
					}
				});
				break;
		}
	};
	$http.jsonp($rootScope.apiLink + '/json/schemas.json?callback=JSON_CALLBACK');
			
	function recursiveIter(sect, child) {
		recursivePush(sect, child);
		var childSect = sect.children;		
		childSect.forEach(function (newSect) {
			recursiveIter(newSect, true);			
		});
	}
	
	function recursivePush(section, child) {
		$scope.sections.push({
			id: section.id,
			title: section.title,
			isChild: child
		});
	}
	
	window.JSON_CALLBACK = function(data) {		
		data["sections"].forEach(function (s) {
			recursiveIter(s, false);
		});
		
		var lastSection;
		data["schema"]["qms"].questions.forEach(function (q) {
			var section = $filter('getByProperty')('id', q.section, $scope.sections);
			$scope.allQuestions.push({
				id: q.id,
				title: q.title,
				type: q.type,
				options: q.options,
				section: section,
				newSection: lastSection != section
			});			
			lastSection = section;
		});
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
	
	$scope.saveSchemaView = function(schemaView) {		
		$scope.schemaView = angular.copy(schemaView);		
		console.log($scope.schemaView);
		if (typeof window.localStorage != "undefined") {
			$scope.setMessage("Saved Schema View.", "");
			localStorage.setItem("SchemaView", schemaView);
			localStorage.setItem("Page", 1);
			localStorage.setItem("Count", $scope.allQuestions.length);
		}
	}
	
	// Check application cache status every 10 seconds
	setInterval(function(){
		if ($rootScope.isOnline) {
			if(!$rootScope.requireUpdate && window.applicationCache.status != window.applicationCache.UNCACHED) {
				window.applicationCache.update(); // Update the cache in background. Won't take effect until reload.				
			}
		}
	}, 10000);
}