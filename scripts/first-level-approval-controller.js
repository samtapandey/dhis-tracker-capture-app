//Controller for the header section
var trackerCapture = angular.module('trackerCapture');
trackerCapture.controller('FirstLevelApprovalController',
    function ($scope, MetaDataFactory,
        DateUtils,
        OrgUnitFactory,
        ProgramFactory,
        AttributesFactory,
        $location,
        $window,
        AMRCustomService,
        $timeout) {
        var previousProgram = null;
        $scope.showtable = false;
        $scope.checked = false;
        $scope.displayAttrHeader = ["Org Unit" , "Patient Registration Number", "Date of Birth", "AMR ID"];

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

        var loadAllOU = function () {
            return AMRCustomService.allOrgUnits().then(function (response) {
               $scope.pathData = response;
            });
        }

        $scope.getProgramStages = function (progId) {
            AMRCustomService.getProgramAttributes(progId.id).then(function (data1) {
                $scope.programStages = [];
                data1.programStages.forEach(function (pgStage) {
                    $scope.programStages.push(pgStage)
                });
            });
        }

        $scope.filterOptionsShow = function () {
            $scope.checked = !$scope.checked;
        }

        $scope.init = function () {
            $scope.loadData();
            loadAllOU();
        }

        $scope.loadData = function () {
            $scope.allEvents = [];
            var selectedProgram = { id: "vbVyZhBu7GG" };
            var selectedProgramStage = { id: "YVtfSSmSNjJ" };
            AMRCustomService.getSectionName().then(function (response) {
                response.organisationUnits.forEach(function (res) {
                    $scope.userOU = res;
                });
                AMRCustomService.getEventsWithoutFilter($scope.userOU, selectedProgram, selectedProgramStage).then(function (response) {
                    response.events.forEach(function (ev) {
                        $scope.allEvents.push(ev);
                    });
                    getEvents($scope.allEvents, selectedProgram, selectedProgramStage);
                });
            });
        }

        $scope.fetchData = function (selectedProgram, selectedProgramStage, startDate, endDate) {
            $scope.allEvents = [];
            if ((!startDate) || (!endDate)) {
                window.alert("Please select the dates correctly");
            }
            else if (moment(endDate).isBefore(moment(startDate))) {
                window.alert('Please select end date Accordingly');
            }
            else {
                AMRCustomService.getEventsWithFilter($scope.selectedOrgUnit, selectedProgram, selectedProgramStage, startDate, endDate).then(function (response) {
                    response.events.forEach(function (ev) {
                        $scope.allEvents.push(ev);
                    });
                    getEvents($scope.allEvents, selectedProgram, selectedProgramStage);
                });
            }
        }

        var getEvents = function (allEvents, selectedProgram, selectedProgramStage) {
            $scope.teiList = []; $scope.displayingValues = [];
            allEvents.forEach(function (evDetails) {
                if (evDetails.status === "COMPLETED") {
                    $scope.teiList.push({ tei: evDetails.trackedEntityInstance, eventId: evDetails.event, ou: evDetails.orgUnit , prgId:evDetails.program });
                }
            });

            $scope.teiList.forEach(function (evData) {
                AMRCustomService.getTEIData(evData, selectedProgram, selectedProgramStage).then(function (response) {
                    response.attributes.forEach(function (attr) {
                        if (attr.code == 'amr_id') {
                            $scope.amr_id = attr.value;
                        }
                        if (attr.code == 'patient_registration_number') {
                            $scope.patientRegNum = attr.value;
                        }
                        if (attr.code == 'dob') {
                            $scope.dOb = attr.value;
                        }
                    });
                    $scope.displayingValues.push({ tei: evData.tei, eventId: evData.eventId, ouId: evData.ou, prg: evData.prgId, path: getPath(evData.ou), amrId: $scope.amr_id, patRegNum: $scope.patientRegNum, dob: $scope.dOb });
                    $scope.amr_id = '', $scope.patientRegNum = '', $scope.dOb = '';
                });
                $scope.showtable = true;
            });
            console.log($scope.displayingValues);
        }

        var getPath = function (pathId) {
            let pathMap = [];
            var hierarchy = "";
           // for (let y = 0; y < pathId.length; y++) {
              for (let z = 0; z < $scope.pathData.organisationUnits.length; z++) {
              //  if ($scope.pathData.organisationUnits[z].id == pathId[y]) {
                if ($scope.pathData.organisationUnits[z].id == pathId) {
                  pathMap.push($scope.pathData.organisationUnits[z].name);
                }
              }
           // }
            for (let i = pathMap.length - 1; i >= 0; i--) {
              hierarchy += pathMap[i] + "/";
            }
            return hierarchy;
          }

        $scope.approvalDashboard = function (tei, eventId1, selectedProgram, evOu) {
            $window.location.assign('../dhis-web-tracker-capture/index.html#/dashboard?tei=' + tei + '&program=' + selectedProgram + '&ou=' + evOu);

            var event = {
                status: "ACTIVE",
            };
            $.ajax({
                type: "PUT",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(event),
                url: DHIS2URL + '/events/' + eventId1 + '/' + event.status, event,
                success: function (response) {
                    console.log("Event updated with Active status:" + eventId1);
                },
                error: function (response) {
                    console.log("Event not updated with Active status:" + eventId1);
                }
            });
        }

    });