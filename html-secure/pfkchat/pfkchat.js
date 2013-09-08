
'use strict';

var lastModified = "2013/09/07  22:45:59";

angular.module("pfkChatApp.services", [])
    .factory('Data', pfkChatDataModel)
    .factory('webSocket', webSocketService);

angular.module("pfkChatApp.controllers", [])
    .controller('pfkChatCtlr', ['$scope', 'Data',
                                'webSocket', pfkChatCtlr])
    .controller('pfkChatLoginCtlr', ['$scope', 'Data',
                                     'webSocket', pfkChatLoginCtlr]);

// could also have directives and filters here

angular.module('pfkChatApp', ['pfkChatApp.services',
                              'pfkChatApp.controllers',
                              'ngRoute'])
    .config(['$routeProvider', function($routeProvider,
                                        $locationProvider) {
        $routeProvider.when('/chat.view', {
            templateUrl: 'views/chat.html',
            controller: 'pfkChatCtlr'
        });
        $routeProvider.when('/login.view', {
            templateUrl: 'views/login.html',
            controller: 'pfkChatLoginCtlr'
        });
        $routeProvider.otherwise({redirectTo: '/chat.view'});
//        $locationProvider.html5Mode(true);
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
