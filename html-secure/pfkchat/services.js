
var pfkChatDataModel = function() {
    var ret = {
        username : localStorage.PFK_Chat_Username,
        userList : [],
        messages : ('PFK_Chat_Messages' in localStorage) ? 
            localStorage.PFK_Chat_Messages : "",
        msgentry : ('PFK_Chat_MsgEntry' in localStorage) ?
            localStorage.PFK_Chat_MsgEntry : "",
        connectionState : "",
        connectionStateColor : "",
        setstate : function(str,color) {
            this.connectionState = str;
            this.connectionStateColor = color;
        }
    };
    delete localStorage.PFK_Chat_Messages;
    delete localStorage.PFK_Chat_MsgEntry;
    return ret;
}

var webSocketService = function() {
    var ret = {
        // user fills these in.

        onReload : null,
        onLoginSuccess : null,
        onConnect : null,
        onDisconnect : null,
        onTrying : null,
        onUserList : null,
        onIm : null,
        onUserStatus : null,

        // user reads or calls, but does not write these.

        socket : null,
        start : null,
        send : null,

        // below this line, internal.

        handlers : [],
        makesocket : null,
        newsocket : null,
        wsuri : ""
    };

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
                if (ret.onReload)
                    ret.onReload();
                location.reload(true);
            }
            else
            {
                ret.socket = ret.newsocket;
                if (ret.onConnect)
                    ret.onConnect();
                else
                    console.log('no onConnect installed');
            }
        };

    ret.handlers[PFK.Chat.ServerToClientType.STC_LOGIN_STATUS] =
        function(stc) {
            if (stc.loginStatus.status ==
                PFK.Chat.LoginStatusValue.LOGIN_ACCEPT)
            {
                if (ret.onLoginSuccess)
                    ret.onLoginSuccess();
                else
                    console.log('no onLoginSuccess attached');
            }
            else
            {
                location.assign(
                    'https://flipk.dyndns-home.com/pfkchat-login.html');
            }
        };

    ret.handlers[PFK.Chat.ServerToClientType.STC_USER_LIST] =
        function(stc) {
            if (ret.onUserList)
                ret.onUserList(stc.userlist.users);
            else
                console.log('no onUserList installed');
        };

    ret.handlers[PFK.Chat.ServerToClientType.STC_IM_MESSAGE] =
        function(stc) {
            if (ret.onIm)
                ret.onIm(stc);
            else
                console.log('no onIm installed');
        };

    ret.handlers[PFK.Chat.ServerToClientType.STC_USER_STATUS] =
        function(stc) {
            if (ret.onUserStatus)
                ret.onUserStatus(stc);
            else
                console.log('no onUserStatus installed');
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
            ret.socket = null;
            delete ret.newsocket;
            ret.newsocket = null;
            if (ret.onDisconnect)
                ret.onDisconnect();
            else
                console.log('no onDisconnect installed');
        };
        ret.newsocket.onmessage = function(msg){
            var stc = PFK.Chat.ServerToClient.decode(msg.data);
            if (stc.type in ret.handlers)
                ret.handlers[stc.type](stc);
        };
    };

    ret.send = function(cts) {
        if (ret.socket)
            ret.socket.send(cts.toArrayBuffer());
        else
            console.log('websocket did not send: not connected');
    }

    ret.start = function() {
        ret.makesocket();
        window.setInterval(function() {
            if (ret.socket == null)
            {
                if (ret.onTrying)
                    ret.onTrying();
                else
                    console.log('no onTrying installed');
                ret.makesocket();
            }
            else
            {
                var cts = new PFK.Chat.ClientToServer;
                cts.type = PFK.Chat.ClientToServerType.CTS_PING;
                ret.send(cts);
            }
        }, 3000);
    };

    window.setTimeout(ret.start, 100);

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
