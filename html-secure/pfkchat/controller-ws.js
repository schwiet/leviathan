
var wsStatusCtlr = function($scope, depData, depWebSocket) {
    $scope.data = depData;
    $scope.webSocket = depWebSocket;
    $scope.status = 'INITIALIZING';
    $scope.statusColor = 'red';
    $scope.lastModified = lastModified;
    $scope.protoVersion = PFK.Chat.CurrentProtoVersion;

    $scope.webSocket.onReload = function() {
        $scope.$apply(function() {
            data.savePersistent();
        })};

    $scope.webSocket.onConnect = function() {
        $scope.$apply(function() {
            if ($scope.data.token == "")
            {
                location.replace("#/login.view");
            }
            else
            {
                var cts = new PFK.Chat.ClientToServer;
                cts.type = PFK.Chat.ClientToServerType.CTS_LOGIN_TOKEN;
                cts.logintoken = new PFK.Chat.LoginToken;
                cts.logintoken.username = $scope.data.username;
                cts.logintoken.token = $scope.data.token;
                $scope.webSocket.send(cts);
            }})};

    $scope.webSocket.onLoginSuccess = function(token) {
        $scope.$apply(function() {
            if (token)
            {
                $scope.data.token = token;
                $scope.data.savePersistent();
            }
            location.replace('#/chat.view');
        })}

    $scope.webSocket.onRegisterResponse = function(success, arg) {
        if (success)
        {
            // arg is token
            $scope.data.token = arg;
            $scope.data.savePersistent();
            location.replace('#/chat.view');
        }
        else
        {
            // arg is reason string
            $scope.createFeedback = arg;
        }
    }

    $scope.webSocket.onUserList = function(userList) {
        $scope.$apply(function() {
            $scope.data.userList = [];
            for (userInd in userList)
                $scope.data.userList.push(
                    { name : userList[userInd].username,
                      typing : userList[userInd].typing });
        })}

    $scope.webSocket.onLoginFail = function() {
        $scope.$apply(function() {
            $scope.status = 'LOGIN REJECTED';
            $scope.statusColor = 'red';
            $scope.data.token = "";
            $scope.data.savePersistent();
            location.replace('#/login.view');
        })};

    $scope.webSocket.onStatusChange = function(status,color) {
        $scope.$apply(function() {
            $scope.status = status;
            $scope.statusColor = color;
        });
    }
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
