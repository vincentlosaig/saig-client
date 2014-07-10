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
	}).
	filter('getByProperty', function() {
		return function(propertyName, propertyValue, collection) {
			var i=0, len=collection.length;
			for (; i<len; i++) {
				if (collection[i][propertyName] == +propertyValue) {
					return collection[i];
				}
			}
			return null;
		}
	});
