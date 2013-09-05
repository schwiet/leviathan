
var get = function(id) {
    return document.getElementById( id );
}

var serverStatus  = get( "serverStatus"  );
var protoVersion = get( "protoVersion" );
var lastModified = get( "lastModified" );

var loginUsername = get( "loginUsername" );
var loginPassword = get( "loginPassword" );
var loginSubmit   = get( "loginSubmit"   );
var loginFeedback = get( "loginFeedback" );

var createUsername       = get( "createUsername"       );
var createPassword       = get( "createPassword"       );
var createPasswordVerify = get( "createPasswordVerify" );
var createSubmit         = get( "createSubmit"         );
var createFeedback       = get( "createFeedback"       );


var wsuri = "";
(function() {
    var myuri = window.location;
    var newuri = "wss://";
    var colon = myuri.host.indexOf(":");
    if (colon == -1)
        newuri += myuri.host;
    else
        newuri += myuri.host.substring(0,colon);
    newuri += "/websocket/pfkchat";
    wsuri = newuri;
})();

var socket = null;
var newsocket = null;

protoVersion.innerHTML = PFK.Chat.CurrentProtoVersion.toString();

if (! ('localStorage' in window))
{
    protoVersion.innerHTML =
        '<span style="color:red"> ' +
        'NO LOCAL STORAGE ' +
        '</span>';
}
else
{
    if (! ('PFK_Chat_CurrentProtoVersion' in localStorage))
    {
        localStorage.PFK_Chat_CurrentProtoVersion = "";
        protoVersion.innerHTML +=
            '<span style="color:red"> ' +
            '(added to localStorage)' +
            '</span>';
    }
    if (localStorage.PFK_Chat_CurrentProtoVersion !=
        PFK.Chat.CurrentProtoVersion)
    {
        protoVersion.innerHTML +=
            '<span style="color:red"> ' +
            '-CHANGED' +
            '</span>';
    }
    localStorage.PFK_Chat_CurrentProtoVersion = PFK.Chat.CurrentProtoVersion;

    if (! ('PFK_Chat_Username' in localStorage))
        localStorage.PFK_Chat_Username = "";
    loginUsername.value = localStorage.PFK_Chat_Username;

    if (! ('PFK_Chat_Password' in localStorage))
        localStorage.PFK_Chat_Password = "";
    loginPassword.value = localStorage.PFK_Chat_Password;

}

var makesocket = function() {
    if (newsocket)
        return;
    newsocket = new WebSocket(wsuri);
    newsocket.binaryType = "arraybuffer";
    newsocket.onopen = function() {
        socket = newsocket;
        console.log("wss connection opened");
        serverStatus.innerHTML = '<span style="color:white"> SERVER UP </span>';

        var protoVerMsg = new PFK.Chat.ClientToServer;
        protoVerMsg.type = PFK.Chat.ClientToServerType.CTS_PROTOVERSION;
        protoVerMsg.protoversion = new PFK.Chat.ProtoVersion;
        protoVerMsg.protoversion.version = PFK.Chat.CurrentProtoVersion;

        socket.send(protoVerMsg.toArrayBuffer());
    }
    newsocket.onclose = function() {
        socket = null;
        delete newsocket;
        newsocket = null;
        serverStatus.innerHTML = '<span style="color:red"> SERVER DOWN </span>';
    }
    newsocket.onmessage = function(msg) {
        var stc = PFK.Chat.ServerToClient.decode(msg.data);
        switch (stc.type)
        {
        case PFK.Chat.ServerToClientType.STC_PROTOVERSION_RESP:
            if (stc.protoversionresp !=
                PFK.Chat.ProtoVersionResp.PROTO_VERSION_MATCH)
            {
                console.log("got protovers resp MISMATCH");
                location.reload(true);
            }
            else
            {
                console.log("got protovers resp MATCH");
            }
            break;

        case PFK.Chat.ServerToClientType.STC_PONG:
            break;

        case PFK.Chat.ServerToClientType.STC_LOGIN_STATUS:
            if (stc.loginStatus.status ==
                PFK.Chat.LoginStatusValue.LOGIN_ACCEPT)
            {
                loginFeedback.innerHTML = "";
                localStorage.PFK_Chat_Username = loginUsername.value;
                localStorage.PFK_Chat_Password = loginPassword.value;
                localStorage.PFK_Chat_Token = stc.loginStatus.token;
                var newurl = 'https://' +
                    localStorage.PFK_Chat_Username + ':' +
                    localStorage.PFK_Chat_Token +
                    '@flipk.dyndns-home.com/pfkchat/';
                location.assign(newurl);
            }
            else
            {
                loginFeedback.innerHTML = "LOGIN REJECTED";
                localStorage.PFK_Chat_Username = "";
                localStorage.PFK_Chat_Password = "";
            }
            break;

        case PFK.Chat.ServerToClientType.STC_REGISTER_STATUS:
            switch (stc.registerStatus.status)
            {
            case PFK.Chat.RegisterStatusValue.REGISTER_INVALID_USERNAME:
                createFeedback.innerHTML =
                    "INVALID USERNAME (only letters and numbers please)";
                break;
            case PFK.Chat.RegisterStatusValue.REGISTER_INVALID_PASSWORD:
                createFeedback.innerHTML =
                    "INVALID PASSWORD (only letters and numbers please)";
                break;
            case PFK.Chat.RegisterStatusValue.REGISTER_DUPLICATE_USERNAME:
                createFeedback.innerHTML =
                    "USERNAME ALREADY IN USE";
                break;
            case PFK.Chat.RegisterStatusValue.REGISTER_ACCEPT:
                localStorage.PFK_Chat_Username = createUsername.value;
                localStorage.PFK_Chat_Password = createPassword.value;
                localStorage.PFK_Chat_Token = stc.registerStatus.token;
                var newurl = 'https://' +
                    localStorage.PFK_Chat_Username + ':' +
                    localStorage.PFK_Chat_Token +
                    '@flipk.dyndns-home.com/pfkchat/';
                location.assign(newurl);
                break;
            }
            break;
        }
    }
}
makesocket();

window.setInterval(
    function() {
        if (socket == null)
        {
            serverStatus.innerHTML = "TRYING (" + wsuri + ")";
            loginFeedback.innerHTML = "";
            createFeedback.innerHTML = "";
            makesocket();
        }
        else
        {
            var ctsmsg = new PFK.Chat.ClientToServer;
            ctsmsg.type = PFK.Chat.ClientToServerType.CTS_PING;
            socket.send(ctsmsg.toArrayBuffer());
        }
    }, 10000);

loginSubmit.onclick = function() {
    if (socket == null)
    {
        loginFeedback.innerHTML = "SERVER DOWN";
        return;
    }

    var ctsmsg = new PFK.Chat.ClientToServer;
    ctsmsg.type = PFK.Chat.ClientToServerType.CTS_LOGIN;
    ctsmsg.login = new PFK.Chat.Login;
    ctsmsg.login.username = loginUsername.value;
    ctsmsg.login.password = loginPassword.value;
    socket.send(ctsmsg.toArrayBuffer());
}

createSubmit.onclick = function() {
    if (socket == null)
    {
        createFeedback.innerHTML = "SERVER DOWN";
        return;
    }
    if (createPassword.value != createPasswordVerify.value)
    {
        createFeedback.innerHTML = "PASSWORDS DON'T MATCH";
        return;
    }
    if (createPassword.value.length < 4)
    {
        createFeedback.innerHTML = "PASSWORD TOO SHORT";
        return;
    }
    var ctsmsg = new PFK.Chat.ClientToServer;
    ctsmsg.type = PFK.Chat.ClientToServerType.CTS_REGISTER;
    ctsmsg.regreq = new PFK.Chat.Register;
    ctsmsg.regreq.username = createUsername.value;
    ctsmsg.regreq.password = createPassword.value;
    socket.send(ctsmsg.toArrayBuffer());
}

lastModified.innerHTML = "2013/09/04  23:03:11";

/*
Local Variables:
mode: javascript
indent-tabs-mode: nil
tab-width: 8
eval: (add-hook 'write-file-hooks 'time-stamp)
time-stamp-line-limit: -30
time-stamp-start: "lastModified.innerHTML = \""
time-stamp-format: "%:y/%02m/%02d  %02H:%02M:%02S\";"
time-stamp-end: "$"
End:
*/
