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

    $scope.firstLevelApproval = function(){
        $location.path('/first-level-approval').search();
    }

    $scope.secondLevelApproval = function(){
        $location.path('/second-level-approval').search();
    }
});