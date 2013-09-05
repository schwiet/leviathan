'use strict';

angular.module('leviathanApp.controllers', [])
  .controller('MyCtrl2', [function() {

  }]);

/* Controllers */

function leviathanCtlr($scope) {
    $scope.usersLoggedIn = [
	{ name : "flipk" },
	{ name : "bob"   },
        { name : "cre"   }
    ];
    $scope.roomsSubscribed = [
	{ unread : 2 , name : "Mail" },
	{ unread : 5 , name : "Lobby" },
	{ unread : 0 , name : "Non Sequitur" },
	{ unread : 0 , name : "Babble" },
	{ unread : 0 , name : "Philosophy" },
	{ unread : 3 , name : "Cars" },
	{ unread : 0 , name : "C" },
	{ unread : 0 , name : "VB6" }
    ];
    $scope.roomsDisplayed = [
	{ unread : 5 , name : "Lobby" },
	{ unread : 2 , name : "Mail" },
	{ unread : 3 , name : "Cars" },
	{ unread : 0 , name : "Non Sequitur" },
	{ unread : 0 , name : "Babble" },
	{ unread : 0 , name : "Philosophy" },
	{ unread : 0 , name : "C" },
	{ unread : 0 , name : "VB6" }
    ];
    $scope.expressSessions = [
        { unread : 1 , name : "bob" },
        { unread : 0 , name : "cre" }
    ];
    $scope.displayRoomRead = function(room) {
        return room.unread > 0 ? 'unread' : 'read';
    }
    $scope.displayRoomUnreadCount = function(room) {
        if (room.unread > 0)
            return '(' + room.unread + ')';
        else
            return '';
    }
}

function dosomething(room) {
    console.log("do something with room: " + room);
}

/*
Last Modified: 2013/09/02  17:04:52

Local Variables:
mode: javascript
indent-tabs-mode: nil
tab-width: 8
eval: (add-hook 'write-file-hooks 'time-stamp)
time-stamp-line-limit: -30
time-stamp-start: "Last Modified: "
time-stamp-format: "%:y/%02m/%02d  %02H:%02M:%02S"
time-stamp-end: "$"
End:
*/
