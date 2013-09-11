
var pfkChatDataModel = function($rootScope) {
    var ret = {
        username   : ('PFK_Chat_Username' in localStorage) ?
            localStorage.PFK_Chat_Username : "",
        password   : ('PFK_Chat_Password' in localStorage) ?
            localStorage.PFK_Chat_Password : "",
        token      : ('PFK_Chat_Token'    in localStorage) ?
            localStorage.PFK_Chat_Token    : "",
        msgentry   : "",
        userList : [],
        immsgs_bcast : [],
        idleTime : 0,

        savePersistent : function() {
            localStorage.PFK_Chat_Username = ret.username;
            localStorage.PFK_Chat_Password = ret.password;
            localStorage.PFK_Chat_Token    = ret.token;
            localStorage.PFK_Chat_MsgEntry = ret.msgentry;
        },

        postmsg : function(uname, message) {
            this.immsgs_bcast.push(
                { username : uname, msg : message });
            if (this.immsgs_bcast.length > 1000)
                this.immsgs_bcast.shift();
        },

        connectionStatus : 'INITIALIZING',
        connectionStatusColor : 'red',

        setStatus : function(status,color) {
            this.connectionStatus = status;
            this.connectionStatusColor = color;
        }
    };
    window.setInterval(function() {
        $rootScope.$apply(function() {
            ret.idleTime ++;
            for (userInd in ret.userList) {
                ret.userList[userInd].idle++;
            }
        });
    }, 1000);
    window.onmousemove = function() {
        var timeWas = ret.idleTime;
        ret.idleTime = 0;
        if (timeWas > 60)
            $rootScope.$broadcast('notIdle');
    }
    window.onkeydown = function() {
        var timeWas = ret.idleTime;
        ret.idleTime = 0;
        if (timeWas > 60)
            $rootScope.$broadcast('notIdle');
    }
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
