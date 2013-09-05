
var get = function(id) {
    return document.getElementById( id );
}

var username = get( "username" ).value;

var message = function(msg){
    var div = get( "messages" );
    div.innerHTML = div.innerHTML + msg + '\n';
    div.scrollTop = div.scrollHeight;
}

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

var username = localStorage.PFK_Chat_Username;
var token = localStorage.PFK_Chat_Token;

get("username").value = username;

message('opening websocket to uri : ' + wsuri);

var server2client_handlers = {};

server2client_handlers[PFK.Chat.ServerToClientType.STC_PROTOVERSION_RESP] =
    function(stc) {
        if (stc.protoversionresp ==
            PFK.Chat.ProtoVersionResp.PROTO_VERSION_MATCH)
        {
            message('proto version match!');
        }
        else
        {
            location.assign('https://flipk.dyndns-home.com/pfkchat-login.html');
        }
    };

server2client_handlers[PFK.Chat.ServerToClientType.STC_LOGIN_STATUS] =
    function(stc) {
        if (stc.loginStatus.status ==
            PFK.Chat.LoginStatusValue.LOGIN_ACCEPT)
        {
            message('logged in!');
        }
        else
        {
            location.assign('https://flipk.dyndns-home.com/pfkchat-login.html');
        }
    };

var makesocket = function () {
    if (newsocket)
        return;
    newsocket = new WebSocket(wsuri);
    newsocket.binaryType = "arraybuffer";
    newsocket.onopen = function() {
        socket = newsocket;
        message('socket opened');
        var cts = new PFK.Chat.ClientToServer;
        cts.type = PFK.Chat.ClientToServerType.CTS_PROTOVERSION;
        cts.protoversion = new PFK.Chat.ProtoVersion;
        cts.protoversion.version = PFK.Chat.CurrentProtoVersion;
        socket.send(cts.toArrayBuffer());
        cts = new PFK.Chat.ClientToServer;
        cts.type = PFK.Chat.ClientToServerType.CTS_LOGIN_TOKEN;
        cts.logintoken = new PFK.Chat.LoginToken;
        cts.logintoken.username = username;
        cts.logintoken.token = token;
        socket.send(cts.toArrayBuffer());
    }
    newsocket.onclose = function() {
        socket = null;
        delete newsocket;
        newsocket = null;
        message('socket closed');
    }
    newsocket.onmessage = function(msg){
        var stc = PFK.Chat.ServerToClient.decode(msg.data);
        var msgtype = stc.type;
        if (msgtype in server2client_handlers)
            server2client_handlers[msgtype](stc);
    }
}
makesocket();

window.setInterval(
    function(){
        if (socket == null)
        {
            message("trying to reconnect...");
            makesocket();
        }
        else
        {
            var cts = new PFK.Chat.ClientToServer;
            cts.type = PFK.Chat.ClientToServerType.CTS_PING;
            socket.send(cts.toArrayBuffer());
        }
    }, 10000);

var sendMessage = function() {
    var txtbox = get( "entry" );
    var im = new PFK.Chat.ClientToServer;
    im.type = PFK.Chat.ClientToServerType.CTS_IM_MESSAGE;
    im.imMessage = new PFK.Chat.IM_Message;
    im.imMessage.username = username;
    im.imMessage.msg = txtbox.value;
    socket.send(im.toArrayBuffer());
    txtbox.value = "";
}

//get( "submit" ).onclick = sendMessage;

//get( "entry" ).onkeypress = function(event) {
//    if (event.keyCode == '13')
//        sendMessage();
//}

//get( "clear" ).onclick = function() {
//    get( "messages" ).innerHTML = "";
//}

//get( "username" ).onblur = function() {
//    var newusername = get("username").value;
//    if (socket)
//    {
//        var chgMsg = new PFK.Chat.ClientToServer;
//        chgMsg.type = PFK.Chat.ClientToServerType.CTS_CHANGE_USERNAME;
//        chgMsg.changeUsername = new PFK.Chat.NewUsername;
//        chgMsg.changeUsername.oldusername = username;
//        chgMsg.changeUsername.newusername = newusername;
//        socket.send(chgMsg.toArrayBuffer());
//    }
//    username = newusername;
//}

// Local Variables:
// mode: Javascript
// indent-tabs-mode: nil
// tab-width: 4
// End:
