
var wsStatusCtlr = function($scope, depData, depWebSocket) {
    $scope.data = depData;
    $scope.webSocket = depWebSocket;
    $scope.lastModified = lastModified;
    $scope.protoVersion = PFK.Chat.CurrentProtoVersion;

    debugWsCtlr = $scope;
}

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
