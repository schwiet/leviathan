
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
