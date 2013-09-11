
var pfkChatCtlr = function($scope, depData) {
    $scope.data = depData;

    $scope.sendMessage = function(msg) {
        $scope.$root.$broadcast('send_IM', msg);
    };

    $scope.stateEmpty = PFK.Chat.TypingState.STATE_EMPTY;
    $scope.stateTyping = PFK.Chat.TypingState.STATE_TYPING;
    $scope.stateEntered = PFK.Chat.TypingState.STATE_ENTERED_TEXT;

    $scope.idle2min = function(secs) {
        if (secs < 60)
            return "";
        var hours = Math.floor(secs / 3600);
        var left = secs - (hours * 3600);
        var mins = Math.floor(left / 60);
        if (secs < 3600)
            return mins.toString() + "m";
        if (mins > 0)
            return hours.toString() + "h" + mins.toString() + "m";
        return hours.toString() + "h";
    };

    (function() {
        var lastSent = null;
        $scope.sendTypingInd = function(state) {
            if (lastSent == null || lastSent != state)
            {
                $scope.$root.$broadcast('sendTypingInd', state);
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
        $scope.data.immsgs_bcast = [];
    }

    $scope.logoutButton = function() {
        $scope.data.token = "";
        $scope.data.savePersistent();
        $scope.$root.$broadcast('sendLogout');
        location.replace('#/login.view');
    }

    if ($scope.data.msgentry == "")
        $scope.sendTypingInd($scope.stateEmpty);
    else
        $scope.sendTypingInd($scope.stateTyping);

    debugChatCtlr = $scope;
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
