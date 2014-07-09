'use strict';

/* Filters */

angular.module('auditApp.filters', []).
	filter('interpolate', function (version) {
		return function (text) {
		  return String(text).replace(/\%VERSION\%/mg, version);
		};
	}).
	filter('range', function() {
		return function(input, total) {
			total = parseInt(total);
			for (var i=0; i<total; i++)
			  input.push(i);
			return input;
		};
	});
