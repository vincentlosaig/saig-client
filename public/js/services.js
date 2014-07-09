'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('auditApp.services', []).
  value('version', '1.0.0');
