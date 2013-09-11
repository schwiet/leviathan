
var chatTableDirective = function() {

    var otherElement = angular.element("<div>{{data.immsgs_bcast}}</div>");

    var link = function(scope, templ, attribs) {
//      otherElement.toggleClass('randomClass');
        console.log('link function scope:', scope);
        console.log('link function templ:', templ);
        console.log('link function attribs:', attribs);

        console.log(scope.data[attribs.messageObject]);
    };

    var ret = {
        restrict: "E",
        replace : true,
        template : '<div>xx xx</div>', // html here
        compile : function (templ) {
            templ.append(otherElement);
            return link;
        }
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
