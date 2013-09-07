
var pfkChatCtlr = function($scope, depData) {
    $scope.data = depData;
    $scope.data.setstate('INITIALIZING', 'red');
    $scope.token = localStorage.PFK_Chat_Token;

    $scope.messagesBox = document.getElementById('messages');
    $scope.message = function(msg) {
        $scope.data.messages += msg + "\n";
        $scope.messagesBox.scrollTop = $scope.messagesBox.scrollHeight;
    };

    var myuri = window.location;
    var newuri = "wss://";
    var colon = myuri.host.indexOf(":");
    if (colon == -1)
        newuri += myuri.host;
    else
        newuri += myuri.host.substring(0,colon);
    newuri += "/websocket/pfkchat";

    $scope.wsuri = newuri;

    $scope.socket = null;
    $scope.newsocket = null;

    $scope.server2client_handlers = {};

    $scope.server2client_handlers[
        PFK.Chat.ServerToClientType.STC_PROTOVERSION_RESP] =
        function(stc) {
            if (stc.protoversionresp !=
                PFK.Chat.ProtoVersionResp.PROTO_VERSION_MATCH)
            {
                localStorage.PFK_Chat_Messages = $scope.data.messages;
                localStorage.PFK_Chat_MsgEntry = $scope.data.msgentry;
                location.reload(true);
            }
        };

    $scope.server2client_handlers[
        PFK.Chat.ServerToClientType.STC_LOGIN_STATUS] =
        function(stc) {
            if (stc.loginStatus.status ==
                PFK.Chat.LoginStatusValue.LOGIN_ACCEPT)
            {
                $scope.data.setstate('LOGGED IN', 'white');
                $scope.sendTypingInd($scope.stateEmpty);
            }
            else
            {
                location.assign(
                    'https://flipk.dyndns-home.com/pfkchat-login.html');
            }
        };

    $scope.server2client_handlers[
        PFK.Chat.ServerToClientType.STC_IM_MESSAGE] =
        function(stc) {
            $scope.message( stc.im.username + ':' + stc.im.msg );
        };

    $scope.server2client_handlers[
        PFK.Chat.ServerToClientType.STC_PONG] =
        function(stc) {
            //nothing
        };

    $scope.server2client_handlers[
        PFK.Chat.ServerToClientType.STC_USER_STATUS] =
        function(stc) {
            var status = " did something bad";

            if (stc.userstatus.status ==
                PFK.Chat.UserStatusValue.USER_LOGGED_IN)
            {
                status = " logged in";
            }
            if (stc.userstatus.status ==
                PFK.Chat.UserStatusValue.USER_LOGGED_OUT)
            {
                status = " logged out";
            }
            
            $scope.message('user ' + stc.userstatus.username + 
                           status);
        };

    $scope.server2client_handlers[
        PFK.Chat.ServerToClientType.STC_USER_LIST] =
        function(stc) {
            $scope.data.userList = [];
            for (userInd in stc.userlist.users) {
                var user = stc.userlist.users[userInd];
                $scope.data.userList.push(
                    { name : user.username,
                      typing : user.typing });
            }
        };

    $scope.makesocket = function() {
        if ($scope.newsocket)
            return;
        $scope.newsocket = new WebSocket($scope.wsuri);
        $scope.newsocket.binaryType = "arraybuffer";
        $scope.newsocket.onopen = function() {
            $scope.$apply(function() {
                $scope.socket = $scope.newsocket;
                $scope.data.setstate('CONNECTED', 'white');
                var cts = new PFK.Chat.ClientToServer;
                cts.type = PFK.Chat.ClientToServerType.CTS_PROTOVERSION;
                cts.protoversion = new PFK.Chat.ProtoVersion;
                cts.protoversion.version = PFK.Chat.CurrentProtoVersion;
                $scope.socket.send(cts.toArrayBuffer());
                cts = new PFK.Chat.ClientToServer;
                cts.type = PFK.Chat.ClientToServerType.CTS_LOGIN_TOKEN;
                cts.logintoken = new PFK.Chat.LoginToken;
                cts.logintoken.username = $scope.data.username;
                cts.logintoken.token = $scope.token;
                $scope.socket.send(cts.toArrayBuffer());
            })};
        $scope.newsocket.onclose = function() {
            $scope.$apply(function() {
                $scope.socket = null;
                delete $scope.newsocket;
                $scope.newsocket = null;
                $scope.data.setstate('DISCONNECTED', 'red');
            })};
        $scope.newsocket.onmessage = function(msg){
            $scope.$apply(function() {
                var stc = PFK.Chat.ServerToClient.decode(msg.data);
                if (stc.type in $scope.server2client_handlers)
                    $scope.server2client_handlers[stc.type](stc);
            })
        };
    };

    $scope.sendMessage = function(msg) {
        var cts = new PFK.Chat.ClientToServer;
        cts.type = PFK.Chat.ClientToServerType.CTS_IM_MESSAGE;
        cts.im = new PFK.Chat.IM_Message;
        cts.im.msg = msg;
        $scope.socket.send(cts.toArrayBuffer());
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
                $scope.socket.send(cts.toArrayBuffer());
            }
            lastSent = state;
        }
    })();

    $scope.msgentryKeyup = function(evt) {
        if (evt.which == 13) // return key
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

    document.getElementById('msgentry').onkeyup = function(evt) {
        $scope.$apply($scope.msgentryKeyup(evt))
    };

    $scope.makesocket();

    window.setInterval(function() {
        $scope.$apply(function() {
            if ($scope.socket == null)
            {
                $scope.data.setstate('TRYING', 'yellow');
                $scope.makesocket();
            }
            else
            {
                var cts = new PFK.Chat.ClientToServer;
                cts.type = PFK.Chat.ClientToServerType.CTS_PING;
                $scope.socket.send(cts.toArrayBuffer());
            }
        })}, 10000);

    $scope.clearButton = function() {
        $scope.data.messages = "";
    };

    debugThingy = $scope;
};

