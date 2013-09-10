
var pfkChatDataModel = function() {
    var ret = {
        username   : ('PFK_Chat_Username' in localStorage) ?
            localStorage.PFK_Chat_Username : "",
        password   : ('PFK_Chat_Password' in localStorage) ?
            localStorage.PFK_Chat_Password : "",
        token      : ('PFK_Chat_Token'    in localStorage) ?
            localStorage.PFK_Chat_Token    : "",
        messages   : ('PFK_Chat_Messages' in localStorage) ? 
            localStorage.PFK_Chat_Messages : "",
        msgentry   : ('PFK_Chat_MsgEntry' in localStorage) ?
            localStorage.PFK_Chat_MsgEntry : "",
        userList : [],

        savePersistent : function() {
            localStorage.PFK_Chat_Username = ret.username;
            localStorage.PFK_Chat_Password = ret.password;
            localStorage.PFK_Chat_Token    = ret.token;
            localStorage.PFK_Chat_Messages = ret.messages;
            localStorage.PFK_Chat_MsgEntry = ret.msgentry;
        },

        connectionStatus : 'INITIALIZING',
        connectionStatusColor : 'red',
    };
    delete localStorage.PFK_Chat_Messages;
    delete localStorage.PFK_Chat_MsgEntry;
    pfkChatData = ret;
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
