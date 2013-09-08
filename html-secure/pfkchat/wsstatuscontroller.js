
var wsStatusCtlr = function($scope, depWebSocket) {
    $scope.webSocket = depWebSocket;
    $scope.status = 'INITIALIZING';
    $scope.statusColor = 'red';
    $scope.lastModified = lastModified;
    $scope.protoVersion = PFK.Chat.CurrentProtoVersion;

    $scope.webSocket.onStatusChange = function(status,color) {
	$scope.$apply(function() {
	    $scope.status = status;
	    $scope.statusColor = color;
	});
    }
}
