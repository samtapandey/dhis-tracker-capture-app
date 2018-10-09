//Controller for the header section
var trackerCapture = angular.module('trackerCapture');
trackerCapture.controller('SecondLevelApprovalController',
function ($scope, MetaDataFactory,
        DateUtils,
        OrgUnitFactory,
        ProgramFactory,
        AttributesFactory,
        $location,
        $window) {
        var previousProgram = null;
        $scope.showtable = false;
        $scope.displayAttrHeader = ["Patient Registration Number", "Date of Birth", "AMR ID"];

        var resolvedEmptyPromise = function () {
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        }

        var loadOrgUnit = function () {
            if ($scope.selectedOrgUnit && !$scope.selectedOrgUnit.loaded) {
                return OrgUnitFactory.getFromStoreOrServer($scope.selectedOrgUnit.id).then(function (orgUnit) {
                    $scope.selectedOrgUnit = orgUnit;
                    $scope.selectedOrgUnit.loaded = true;
                });
            }
            return resolvedEmptyPromise();
        }

        $scope.$watch('selectedOrgUnit', function (a, b, c) {
            if (angular.isObject($scope.selectedOrgUnit) && !$scope.selectedOrgUnit.loaded) {
                loadOrgUnit()
                    .then(loadPrograms)
            }
        });

        var loadPrograms = function () {
            return ProgramFactory.getProgramsByOu($scope.selectedOrgUnit, true, previousProgram).then(function (response) {
                $scope.programs = response.programs;
                $scope.getProgramStages(response.selectedProgram);
            });
        }

        $scope.getProgramStages = function (progId) {
            $scope.selectedProgramID = progId.id;
            var url1 = DHIS2URL + "/programs/" + progId.id + ".json?fields=id,name,withoutRegistration,programTrackedEntityAttributes[*],programStages[id,name,programStageDataElements[id,dataElement[id,name,optionSet[options[code,displayName]],sortOrder]]]&paging=false";
            $.get(url1, function (data1) {
                $scope.programStages = [];
                data1.programStages.forEach(function (pgStage) {
                    $scope.programStages.push(pgStage)
                });
            });
        }
        
        $scope.fetchData = function (selectedProgram, selectedProgramStage, startDate, endDate) {

        }
    
});