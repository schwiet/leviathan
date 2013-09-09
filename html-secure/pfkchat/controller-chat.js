
var pfkChatCtlr = function($scope, depData, depWebSocket) {
    $scope.data = depData;
    $scope.webSocket = depWebSocket;

    $scope.messagesBox = document.getElementById('messages');
    $scope.message = function(msg) {
        $scope.data.messages += msg + "\n";
        $scope.messagesBox.scrollTop = $scope.messagesBox.scrollHeight;
    };

    $scope.webSocket.onIm = function(stc) {
        $scope.$apply(function() {
            $scope.message( stc.im.username + ':' + stc.im.msg );
        })}

    $scope.webSocket.onUserStatus = function(stc) {
        $scope.$apply(function() {
            var status = {};
	    switch (stc.userstatus.status)
	    {
	    case PFK.Chat.UserStatusValue.USER_LOGGED_IN:
                status = " logged in";
		break;
	    case PFK.Chat.UserStatusValue.USER_LOGGED_OUT:
                status = " logged out";
		break;
	    default:
		status = " did something bad";
	    }
            $scope.message('user ' + stc.userstatus.username + 
                           status);
        })}

    $scope.sendMessage = function(msg) {
        var cts = new PFK.Chat.ClientToServer;
        cts.type = PFK.Chat.ClientToServerType.CTS_IM_MESSAGE;
        cts.im = new PFK.Chat.IM_Message;
        cts.im.msg = msg;
        $scope.webSocket.send(cts);
    }

    $scope.stateEmpty = PFK.Chat.TypingState.STATE_EMPTY;
    $scope.stateTyping = PFK.Chat.TypingState.STATE_TYPING;
    $scope.stateEntered = PFK.Chat.TypingState.STATE_ENTERED_TEXT;

    (function() {
        var lastSent = null;
        $scope.sendTypingInd = function(state) {
            if (lastSent == null || lastSent != state)
            {
                var cts = new PFK.Chat.ClientToServer;
                cts.type = PFK.Chat.ClientToServerType.CTS_TYPING_IND;
                cts.typing = new PFK.Chat.TypingInd;
                cts.typing.state = state;
                $scope.webSocket.send(cts);
            }
            lastSent = state;
        }
    })();

    $scope.msgentryKeyup = function(key) {
        if (key.which == 13) // return key
        {
            $scope.sendMessage($scope.data.msgentry);
            $scope.data.msgentry = "";
            $scope.sendTypingInd($scope.stateEmpty);
        }
        else
        {
            if ($scope.data.msgentry.length > 0)
                $scope.sendTypingInd($scope.stateTyping);
            else
                $scope.sendTypingInd($scope.stateEmpty);
            //            $scope.sendTypingInd($scope.stateEnteredText);
        }
    }

    $scope.clearButton = function() {
        $scope.data.messages = "";
    }

    $scope.logoutButton = function() {
        $scope.data.token = "";
        $scope.data.savePersistent();
        $scope.webSocket.reset();
        location.replace('#/login.view');
    }

    if ($scope.data.msgentry == "")
        $scope.sendTypingInd($scope.stateEmpty);
    else
        $scope.sendTypingInd($scope.stateTyping);

    debugThingy = $scope;
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
