
var webSocketService = function($rootScope, data) {
    var ret = {
        socket : null,
        handlers : [],
        makesocket : null,
        newsocket : null,
        wsuri : ""
    };

    debugWsService = ret;
    debugWsRootScope = $rootScope;

    var myuri = window.location;
    var newuri = "wss://";
    var colon = myuri.host.indexOf(":");
    if (colon == -1)
        newuri += myuri.host;
    else
        newuri += myuri.host.substring(0,colon);
    newuri += "/websocket/pfkchat";
    ret.wsuri = newuri;

    ret.handlers[PFK.Chat.ServerToClientType.STC_PROTOVERSION_RESP] =
        function(stc) {
            if (stc.protoversionresp !=
                PFK.Chat.ProtoVersionResp.PROTO_VERSION_MATCH)
            {
                data.savePersistent();
                location.reload(true);
            }
            else
            {
                ret.socket = ret.newsocket;
                data.connectionStatus = 'CONNECTED';
                data.connectionStatusColor = 'white';
                if (data.token == "")
                {
                    location.replace("#/login.view");
                }
                else
                {
                    var cts = new PFK.Chat.ClientToServer;
                    cts.type = PFK.Chat.ClientToServerType.CTS_LOGIN_TOKEN;
                    cts.logintoken = new PFK.Chat.LoginToken;
                    cts.logintoken.username = data.username;
                    cts.logintoken.token = data.token;
                    if (ret.socket)
                        ret.socket.send(cts.toArrayBuffer());
                }



            }
        };

    ret.handlers[PFK.Chat.ServerToClientType.STC_REGISTER_STATUS] =
        function(stc) {
            switch (stc.registerStatus.status)
            {
            case PFK.Chat.RegisterStatusValue.REGISTER_INVALID_USERNAME:
                $rootScope.$broadcast(
                    'registerFailure',
                    "INVALID USERNAME (only letters and numbers please)");
                break;
            case PFK.Chat.RegisterStatusValue.REGISTER_INVALID_PASSWORD:
                $rootScope.$broadcast(
                    'registerFailure',
                    "INVALID PASSWORD (only letters and numbers please)");
                break;
            case PFK.Chat.RegisterStatusValue.REGISTER_DUPLICATE_USERNAME:
                $rootScope.$broadcast(
                    'registerFailure',
                    "USERNAME ALREADY IN USE");
                break;
            case PFK.Chat.RegisterStatusValue.REGISTER_ACCEPT:
                data.token = stc.registerStatus.token;
                data.savePersistent();
                location.replace('#/chat.view');
                break;
            }
        };

    ret.handlers[PFK.Chat.ServerToClientType.STC_LOGIN_STATUS] =
        function(stc) {
            if (stc.loginStatus.status ==
                PFK.Chat.LoginStatusValue.LOGIN_ACCEPT)
            {
                data.connectionStatus = 'LOGGED IN';
                data.connectionStatusColor = 'white';
                if (stc.loginStatus.token)
                {
                    data.token = stc.loginStatus.token;
                    data.savePersistent();
                }
                location.replace('#/chat.view');
            }
            else
            {
                data.connectionStatus = 'LOGIN REJECTED';
                data.connectionStatusColor = 'red';
                data.token = "";
                data.savePersistent();
                location.replace('#/login.view');
            }
        };

    ret.handlers[PFK.Chat.ServerToClientType.STC_USER_LIST] =
        function(stc) {
            var userList = stc.userlist.users;
            data.userList = [];
            for (userInd in userList)
                data.userList.push(
                    { name : userList[userInd].username,
                      typing : userList[userInd].typing });
        };

    ret.handlers[PFK.Chat.ServerToClientType.STC_IM_MESSAGE] =
        function(stc) {
            $rootScope.$broadcast('IM', stc);
        };

    ret.handlers[PFK.Chat.ServerToClientType.STC_USER_STATUS] =
        function(stc) {
            $rootScope.$broadcast('userStatus', stc.userstatus );
        };

    ret.handlers[PFK.Chat.ServerToClientType.STC_PONG] =
        function(stc) {
//          console.log('got pong');
        };

    ret.makesocket = function() {
        if (ret.newsocket)
            return;
        ret.newsocket = new WebSocket(ret.wsuri);
        ret.newsocket.binaryType = "arraybuffer";
        ret.newsocket.onopen = function() {
            var cts = new PFK.Chat.ClientToServer;
            cts.type = PFK.Chat.ClientToServerType.CTS_PROTOVERSION;
            cts.protoversion = new PFK.Chat.ProtoVersion;
            cts.protoversion.version = PFK.Chat.CurrentProtoVersion;
            ret.newsocket.send(cts.toArrayBuffer());
        };
        ret.newsocket.onclose = function() {
            if (ret.newsocket)
                ret.newsocket.close();
            ret.socket = null;
            delete ret.newsocket;
            ret.newsocket = null;
            data.connectionStatus = 'DISCONNECTED';
            data.connectionStatusColor = 'red';
        };
        ret.newsocket.onmessage = function(msg){
            var stc = PFK.Chat.ServerToClient.decode(msg.data);
            if (stc.type in ret.handlers)
                $rootScope.$apply(function() {
                    ret.handlers[stc.type](stc);
                });
        };
    };

    $rootScope.$on('send_IM', function(scope,msg) {
        var cts = new PFK.Chat.ClientToServer;
        cts.type = PFK.Chat.ClientToServerType.CTS_IM_MESSAGE;
        cts.im = new PFK.Chat.IM_Message;
        cts.im.msg = msg;
        if (ret.socket)
            ret.socket.send(cts.toArrayBuffer());
    });

    $rootScope.$on('sendTypingInd', function(scope,state) {
        var cts = new PFK.Chat.ClientToServer;
        cts.type = PFK.Chat.ClientToServerType.CTS_TYPING_IND;
        cts.typing = new PFK.Chat.TypingInd;
        cts.typing.state = state;
        if (ret.socket)
            ret.socket.send(cts.toArrayBuffer());
    });

    $rootScope.$on('sendLogin', function(scope,username,password) {
        var cts = new PFK.Chat.ClientToServer;
        cts.type = PFK.Chat.ClientToServerType.CTS_LOGIN;
        cts.login = new PFK.Chat.Login;
        cts.login.username = username;
        cts.login.password = password;
        if (ret.socket)
            ret.socket.send(cts.toArrayBuffer());
    });

    $rootScope.$on('sendRegister', function(scope,username,password) {
        var cts = new PFK.Chat.ClientToServer;
        cts.type = PFK.Chat.ClientToServerType.CTS_REGISTER;
        cts.regreq = new PFK.Chat.Register;
        cts.regreq.username = username;
        cts.regreq.password = password;
        if (ret.socket)
            ret.socket.send(cts.toArrayBuffer());
    });

    $rootScope.$on('sendLogout', function(scope) {
        var cts = new PFK.Chat.ClientToServer;
        cts.type = PFK.Chat.ClientToServerType.CTS_LOGOUT;
        if (ret.socket)
            ret.socket.send(cts.toArrayBuffer());
        data.connectionStatus = 'CONNECTED';
        data.connectionStatusColor = 'white';
    });

    window.setTimeout(function() {
        ret.makesocket();
        window.setInterval(function() {
            if (ret.socket == null)
            {
                data.connectionStatus = 'TRYING';
                data.connectionStatusColor = 'yellow';
                ret.makesocket();
            }
            else
            {
                var cts = new PFK.Chat.ClientToServer;
                cts.type = PFK.Chat.ClientToServerType.CTS_PING;
                ret.socket.send(cts.toArrayBuffer());
            }
        }, 3000);
    }, 100);

    return ret;
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
