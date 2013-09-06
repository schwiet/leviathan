
var lastModified = "2013/09/05  23:55:54";

var app = angular.module("pfkChatApp", [])

app.factory('Data', function() {
    return {};
})

var debugThingy = {};
var debugKey = {};

function pfkChatCtlr($scope, Data) {
    $scope.data = Data;
    $scope.data.username = localStorage.PFK_Chat_Username;
    $scope.data.userList = "";

    if ('PFK_Chat_Messages' in localStorage)
        $scope.data.messages = localStorage.PFK_Chat_Messages;
    else
        $scope.data.messages = "";
    delete localStorage.PFK_Chat_Messages;

    if ('PFK_Chat_MsgEntry' in localStorage)
        $scope.data.msgentry = localStorage.PFK_Chat_MsgEntry;
    else
        $scope.data.msgentry = "";
    delete localStorage.PFK_Chat_MsgEntry;

    $scope.data.lastModified = lastModified;

    $scope.setstate = function(str,color) {
        $scope.data.connectionState = str;
        $scope.data.connectionStateColor = color;
    }

    $scope.setstate('INITIALIZING', 'red');

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
                $scope.setstate('LOGGED IN', 'white');
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
            var list = "";
            for (userInd in stc.userlist.users) {
                list += stc.userlist.users[userInd] + ' ';
            }
            $scope.data.userList = list;
        };

    $scope.makesocket = function() {
        if ($scope.newsocket)
            return;
        $scope.newsocket = new WebSocket($scope.wsuri);
        $scope.newsocket.binaryType = "arraybuffer";
        $scope.newsocket.onopen = function() {
            $scope.$apply(function() {
                $scope.socket = $scope.newsocket;
                $scope.setstate('CONNECTED', 'white');
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
                $scope.setstate('DISCONNECTED', 'red');
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

    $scope.makesocket();

    window.setInterval(function() {
        $scope.$apply(function() {
            if ($scope.socket == null)
            {
                $scope.setstate('TRYING', 'yellow');
                $scope.makesocket();
            }
            else
            {
                var cts = new PFK.Chat.ClientToServer;
                cts.type = PFK.Chat.ClientToServerType.CTS_PING;
                $scope.socket.send(cts.toArrayBuffer());
            }
        })}, 10000);

    $scope.msgentryKeyup = function(evt) {
        if (evt.which == 13) // return key
        {
            $scope.sendMessage($scope.data.msgentry);
            $scope.data.msgentry = "";
        }
    };

    $scope.clearButton = function() {
        $scope.data.messages = "";
    };

    document.getElementById('msgentry').onkeyup = function(evt) {
        $scope.$apply($scope.msgentryKeyup(evt))
    };

    debugThingy = $scope;
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
