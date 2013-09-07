
var lastModified = "2013/09/07  01:47:36";

angular.module("pfkChatApp", [])
    .factory('Data', pfkChatDataModel)
    .factory('webSocket', webSocketService)
    .controller('pfkChatCtlr', ['$scope', 'Data',
                                'webSocket', pfkChatCtlr]);

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
