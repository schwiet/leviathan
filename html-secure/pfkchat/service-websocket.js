
var webSocketService = function() {
    var ret = {
        // user fills these in.

        onRegisterResponse : null,
        onReload : null,
        onConnect : null,
        onLoginSuccess : null,
        onLoginFail : null,
        onUserStatus : null,
        onStatusChange : null,
        onUserList : null,
        onIm : null,

        // user reads or calls, but does not write these.

        send : null,
        reset : null,

        // below this line, internal.

        socket : null,
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
                if (ret.onStatusChange)
                    ret.onStatusChange('CONNECTED','white');
                else
                    console.log('no onStatusChange installed');
                if (ret.onConnect)
                    ret.onConnect();
                else
                    console.log('no onConnect installed');
            }
        };

    ret.handlers[PFK.Chat.ServerToClientType.STC_REGISTER_STATUS] =
        function(stc) {
            switch (stc.registerStatus.status)
            {
            case PFK.Chat.RegisterStatusValue.REGISTER_INVALID_USERNAME:
                ret.onRegisterResponse(
                    false,
                    "INVALID USERNAME (only letters and numbers please)");
                break;
            case PFK.Chat.RegisterStatusValue.REGISTER_INVALID_PASSWORD:
                ret.onRegisterResponse(
                    false,
                    "INVALID PASSWORD (only letters and numbers please)");
                break;
            case PFK.Chat.RegisterStatusValue.REGISTER_DUPLICATE_USERNAME:
                ret.onRegisterResponse(
                    false,
                    "USERNAME ALREADY IN USE");
                break;
            case PFK.Chat.RegisterStatusValue.REGISTER_ACCEPT:
                ret.onRegisterResponse(true,
                                       stc.registerStatus.token);
                break;
            }
        };

    ret.handlers[PFK.Chat.ServerToClientType.STC_LOGIN_STATUS] =
        function(stc) {
            if (stc.loginStatus.status ==
                PFK.Chat.LoginStatusValue.LOGIN_ACCEPT)
            {
                if (ret.onStatusChange)
                    ret.onStatusChange('LOGGED IN','white');
                else
                    console.log('no onStatusChange attached');
                if (ret.onLoginSuccess)
                    ret.onLoginSuccess(stc.loginStatus.token);
                else
                    console.log('no onLoginSuccess installed');
            }
            else
            {
                if (ret.onLoginFail)
                    ret.onLoginFail();
                else
                    console.log('no onLoginFail installed');
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
/* it is okay if this is not registered. if the chat controller
   isn't running, we don't care about this message. it doesn't
   update the data model.
            else
                console.log('no onUserStatus installed'); */
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
            if (ret.onStatusChange)
                ret.onStatusChange('DISCONNECTED','red');
            else
                console.log('no onStatusChange installed');
            console.log('disconnected!');
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

    ret.reset = function() {
        ret.socket.close();
        delete ret.socket;
        ret.socket = null;
        ret.newsocket = null;
        window.setTimeout(function() {
            ret.makesocket();
        }, 500);
    }

    window.setTimeout(function() {
        ret.makesocket();
        window.setInterval(function() {
            if (ret.socket == null)
            {
                if (ret.onStatusChange)
                    ret.onStatusChange('TRYING','yellow');
                else
                    console.log('no onStatusChange installed');
                ret.makesocket();
            }
            else
            {
                var cts = new PFK.Chat.ClientToServer;
                cts.type = PFK.Chat.ClientToServerType.CTS_PING;
                ret.send(cts);
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
