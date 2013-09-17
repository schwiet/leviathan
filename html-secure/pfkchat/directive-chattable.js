
var chatTableDirective = function() {

    var params = {
        box : null,
        scrollbox : null,
        height : 400
    };

//    var newelement = angular.element('<some html />');

    var preLink = function(scope, iElement, iAttrs, controller) {
    }
    var postLink = function(scope, iElement, iAttrs, controller) {
        console.log('postLink',controller);
        gBoxParams = params;
        params.box = iElement;
        params.scrollbox = iElement.children(0)[1];
        params.box.css("height",params.height.toString() + "px");
    }

    var ret = {
        restrict: "E",
        replace : true,
        scope : {
            // variables here can be substituted in the template!
            // '@' means look at <chattable> attributes and copy.
            // '=' means set up 2-way binding with variable name in
            // parent scope (controller in this case)
            // '&' means hook for function execution.
            boxTitle : '@',
            inputWidth : '@', // see ng-attr- in template
            messages : '=',
            myusername : '=',
            msgentry : '=',
            msgentrykeyup : '=',
            clearbutton : '='
        },
// require: 'sibling' or '^parent'  (note new arg to link funcs)
        templateUrl : 'chatbox.html',
        // scope is this object's scope
        // element is the template
        controller : function($scope, $element, $attrs, $transclude
//                              , otherInjectables
                             ) {
            directive_scope = this;
            $scope.boxheight = 400;
            $scope.chatplus = function() {
                params.height += 100;
                params.box.css("height",params.height.toString() + "px");
            }
            $scope.chatminus = function() {
                params.height -= 100;
                params.box.css("height",params.height.toString() + "px");
            }

            $scope.$watchCollection('messages',function(newVals,oldVals) {
                // for some reason setting scrollTop doesn't work
                // inside watchCollection -- it's always off by some,
                // probably because the box needs to redraw for scrollHeight
                // to be updated? it works from a timer though.
                window.setTimeout(function() {
                    params.scrollbox.scrollTop =
                        params.scrollbox.scrollHeight;
                }, 100);
            });
        },

        // templ is the chatbox.html elements.
        // attrs is the attributes passed to <chattable>
        compile : function(templ,attrs) {
            //templ.append(new elements?)
            return {
                pre : preLink,
                post : postLink
            }
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
