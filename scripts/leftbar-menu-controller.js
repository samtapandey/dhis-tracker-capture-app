//Controller for column show/hide
var trackerCapture = angular.module('trackerCapture');
trackerCapture.controller('LeftBarMenuController',
        function($scope,
                $location) {
    $scope.showHome = function(){
        selection.load();
        $location.path('/').search();
    }; 
    
    $scope.showReportTypes = function(){
        $location.path('/report-types').search();
    };

    $scope.showQueueInterface = function(){
        $location.path('/queue').search();
    };
	$scope.showApexQueueInterface = function(){
        $location.path('/apexqueue').search();
    };

  	$scope.showQueueInterfaceAEMS = function(){
        $location.path('/queueAEMS').search();
    };
	$scope.showApexQueueInterfaceAEMS = function(){
        $location.path('/apexqueueAEMS').search();
    };
});
