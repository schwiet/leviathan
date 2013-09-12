
var chatTableDirective = function() {

//    var newelement = angular.element('<some html />');
//    link : function(scope, templ, attribs, ^requires) {
//        modify newelement somehow;
//    }
//    compile : function(templ) {
//        templ.append(newelement);
//        return link;
//    }

    var ret = {
        restrict: "E",
        replace : true,
        template : 
            '<table class="chattable">' +
            '  <tr ng-repeat="immsg in data.immsgs_bcast">' +
            '    <td class="chattable-username">' +
            '      {{immsg.username}} </td>' +
            '    <td style="border:1px solid green;' +
            '               border-radius:5px;">' +
            '      {{immsg.msg}} </td>' +
            '  </tr><tr>' +
            '    <td class="chattable-msg" >' +
            '      {{data.username}}' +
            '    </td>' +
            '    <td style="">' +
            '      <input ng-keyup="msgentryKeyup($event)"' +
            '             ng-model="data.msgentry" type="text"' +
            '             autofocus size=70 />' +
            '    </td>' +
            '  </tr>' +
            '</table>'
    };
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
