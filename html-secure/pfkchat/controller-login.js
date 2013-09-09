
var pfkChatLoginCtlr = function($scope, depData, depWebSocket) {
    $scope.data = depData;
    $scope.webSocket = depWebSocket;

    $scope.loginFeedback = "";
    $scope.createFeedback = "";

    $scope.newusername = "";
    $scope.newpassword = "";
    $scope.newpassword2 = "";

    $scope.loginButton = function() {
        var cts = new PFK.Chat.ClientToServer;
        cts.type = PFK.Chat.ClientToServerType.CTS_LOGIN;
        cts.login = new PFK.Chat.Login;
        cts.login.username = $scope.data.username;
        cts.login.password = $scope.data.password;
        $scope.webSocket.send(cts);
    }

    $scope.registerButton = function() {
        if ($scope.newpassword != $scope.newpassword2)
        {
            $scope.createFeedback = "PASSWORDS DON'T MATCH";
            return;
        }
        if ($scope.newpassword.length < 4)
        {
            $scope.createFeedback = "PASSWORD TOO SHORT";
            return;
        }
        var cts = new PFK.Chat.ClientToServer;
        cts.type = PFK.Chat.ClientToServerType.CTS_REGISTER;
        cts.regreq = new PFK.Chat.Register;
        cts.regreq.username = $scope.newusername;
        cts.regreq.password = $scope.newpassword;
        $scope.webSocket.send(cts);
        $scope.data.username = $scope.newusername;
        $scope.data.password = $scope.newpassword;
        $scope.data.token = "";
    }

    $scope.data.messages = "";
    $scope.data.msgentry = "";
    $scope.data.savePersistent();

};

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
