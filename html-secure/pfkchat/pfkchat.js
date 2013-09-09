
'use strict';

var lastModified = "2013/09/08  22:46:46";

angular.module("pfkChatApp.services", [])
    .factory('Data', pfkChatDataModel)
    .factory('webSocket', webSocketService);

angular.module("pfkChatApp.controllers", [])
    .controller('wsStatusCtlr', ['$scope', 'Data', 'webSocket',
                                 wsStatusCtlr])
    .controller('pfkChatCtlr', ['$scope', 'Data', 'webSocket',
                                pfkChatCtlr])
    .controller('pfkChatLoginCtlr', ['$scope', 'Data', 'webSocket',
                                     pfkChatLoginCtlr]);

// could also have directives and filters here

angular.module('pfkChatApp', ['pfkChatApp.services',
                              'pfkChatApp.controllers',
                              'ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/chat.view', {
            templateUrl: 'chat.html',  controller: 'pfkChatCtlr'      });
        $routeProvider.when('/login.view', {
            templateUrl: 'login.html', controller: 'pfkChatLoginCtlr' });
        $routeProvider.otherwise({redirectTo: '/login.view'});
    }]);

/*
  Local Variables:
  mode: javascript
  indent-tabs-mode: nil
  tab-width: 8
  eval: (add-hook 'write-file-hooks 'time-stamp)
  time-stamp-line-limit: 5
  time-stamp-start: "lastModified = \""
  time-stamp-format: "%:y/%02m/%02d  %02H:%02M:%02S\";"
  time-stamp-end: "$"
  End:
*/
