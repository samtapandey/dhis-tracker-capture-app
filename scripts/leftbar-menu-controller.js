//Controller for column show/hide
var trackerCapture = angular.module('trackerCapture');
trackerCapture.controller('LeftBarMenuController',
        function($scope,
                $location,
                AMRCustomService) {
    $scope.showHome = function(){
        selection.load();
        $location.path('/').search();
    }; 
    
    $scope.showReportTypes = function(){
        $location.path('/report-types').search();
    };

    $scope.firstLevelApproval = function () {
        $location.path('/first-level-approval').search();
    };

    $scope.secondLevelApproval = function () {
        $location.path('/second-level-approval').search();
    };

    $scope.validLevel1UserGroup = false;
    $scope.validLevel2UserGroup = false;
    $scope.level1UserGroupNameCode = 'Level 1 Approval Users';
    $scope.level2UserGroupNameCode = 'Level 2 Approval Users';

    //FOR AMR Section Work
    AMRCustomService.getSectionName().then(function (selectedSectionName) {
        var trackdata = selectedSectionName;
        $scope.customSectionName = trackdata.surname;
        if (trackdata.userGroups != undefined) {
            for (var j = 0; j < trackdata.userGroups.length; j++) {
                if (trackdata.userGroups[j].name === $scope.level1UserGroupNameCode) {
                    $scope.validLevel1UserGroup = true;
                }
                else if (trackdata.userGroups[j].name === $scope.level2UserGroupNameCode) {
                    $scope.validLevel2UserGroup = true;
                }
                else {
                    $scope.validLevel1UserGroup = true;
                    $scope.validLevel2UserGroup = true;
                }
            }
        }
    });
});