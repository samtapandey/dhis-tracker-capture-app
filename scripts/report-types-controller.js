//Controller for the header section
var trackerCapture = angular.module('trackerCapture');
trackerCapture.controller('ReportTypesController',
        function($scope,
                $location,
                AMRCustomService) {    
    $scope.programSummary = function(){
        selection.load();
        $location.path('/program-summary').search();
    };
    
    $scope.programStatistics = function(){   
        selection.load();
        $location.path('/program-statistics').search();
    };
    
    $scope.overdueEvents = function(){   
        selection.load();
        $location.path('/overdue-events').search();
    };   
    
    $scope.upcomingEvents = function(){
        selection.load();
        $location.path('/upcoming-events').search();
    };

    $scope.validLevel1UserGroup = false;
    $scope.validLevel2UserGroup = false;
    $scope.level1UserGroupNameCode = 'level_1_approval_users'
    $scope.level2UserGroupNameCode = 'level_2_approval_users'
    
    //FOR AMR Section Work
    AMRCustomService.getSectionName().then(function(selectedSectionName){
        var trackdata = selectedSectionName;
        $scope.customSectionName = trackdata.surname;
        if(trackdata.userGroups != undefined)
        {
            for(var j = 0; j<trackdata.userGroups.length; j++)
            {
                if(trackdata.userGroups[j].code === $scope.level1UserGroupNameCode)
                {
                    $scope.validLevel1UserGroup = true;
                    break;
                }
                else if(trackdata.userGroups[j].code === $scope.level2UserGroupNameCode)
                {
                    $scope.validLevel2UserGroup = true;
                    break;
                }
            }
        }
        console.log($scope.customSectionName);
    });
});