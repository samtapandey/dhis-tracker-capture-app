//Controller for the header section
var trackerCapture = angular.module('trackerCapture');
trackerCapture.controller('SecondLevelApprovalController',
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
        $scope.displayAttrHeader = ["Org Unit", "Patient Registration Number", "Date of Birth", "AMR ID", "Approval Status", "Reason of Rejection/Reopen"];

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
        }

        $scope.loadData = function () {
            $scope.allEvents = [];
            var selectedProgram = { id: "vbVyZhBu7GG" };
            AMRCustomService.getSectionName().then(function (response) {
                response.organisationUnits.forEach(function (res) {
                    $scope.userOU = res;
                });
                AMRCustomService.getEventsWithoutFilterForSecLevel($scope.userOU, selectedProgram).then(function (response) {
                    response.events.forEach(function (ev) {
                        $scope.allEvents.push(ev);
                    });
                    getEvents($scope.allEvents, selectedProgram);
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
                    getEvents($scope.allEvents, selectedProgram);
                });
            }
        }

        var getEvents = function (allEvents, selectedProgram) {
            $scope.teiList = []; $scope.displayingValues = [];
            allEvents.forEach(function (evDetails) {
                $scope.eventDV = [];$scope.approveRejectStatus = '';
                evDetails.dataValues.forEach(function (evDV) {
                    if (evDV.dataElement == 'ZL2TKQz6TKF') {
                        $scope.approveRejectStatus = evDV.value;
                    }
                });
                if ((evDetails.status === "COMPLETED" && $scope.approveRejectStatus === 'approve') || (evDetails.status === "ACTIVE" && $scope.approveRejectStatus === 'approve')) {
                    $scope.teiList.push({ tei: evDetails.trackedEntityInstance, eventId: evDetails.event, ou: evDetails.orgUnit, prgId: evDetails.program, evDV: evDetails.dataValues });
                }
            });

            if ($scope.teiList.length == 0) {
                $('#tableid').html("No records found!");
            } else {
                $scope.teiList.forEach(function (evData) {
                    AMRCustomService.getTEIData(evData, selectedProgram).then(function (response) {
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
                        evData.evDV.forEach(function (de) {
                            if (de.dataElement == 'ZL2TKQz6TKF') {
                                $scope.approveRejectStatus = de.value;
                            }
                            if (de.dataElement == 'PI65n9eD9jh') {
                                $scope.reasonOfRejection = de.value;
                            }
                        });
                        $scope.displayingValues.push({ tei: evData.tei, eventId: evData.eventId, ouId: evData.ou, prg: evData.prgId, path: getPath(evData.ou), amrId: $scope.amr_id, patRegNum: $scope.patientRegNum, dob: $scope.dOb, apprRejStatus: $scope.approveRejectStatus, reasonOfRej: $scope.reasonOfRejection });
                        $scope.amr_id = '', $scope.patientRegNum = '', $scope.dOb = ''; $scope.approveRejectStatus = ''; $scope.reasonOfRejection = '';
                    });
                    $scope.showtable = true;
                });
                console.log($scope.displayingValues);
            }
        }

        var getPath = function (pathId) {
            $scope.hierarchy = "";
            var myMap = [];

            $.ajax({
                async: false,
                type: "GET",
                url: DHIS2URL + "/organisationUnits/" + pathId + ".json?fields=name,level,parent[name,level,parent[id,name,level,parent[name,level,parent[name,level,parent[name,level,parent[name,level,parent[name,level,parent[name,level]",
                success: function (response) {
                    if (response.level == 1) {
                        myMap.push(response.name);
                    }
                    if (response.level == 2) {
                        myMap.push(response.name);
                        myMap.push(response.parent.name)
                    }
                    if (response.level == 3) {
                        myMap.push(response.name);
                        myMap.push(response.parent.name)
                        myMap.push(response.parent.parent.name)
                    }
                    if (response.level == 4) {
                        myMap.push(response.name);
                        myMap.push(response.parent.name)
                        myMap.push(response.parent.parent.name)
                        myMap.push(response.parent.parent.parent.name)
                    }
                    if (response.level == 5) {
                        myMap.push(response.name);
                        myMap.push(response.parent.name)
                        myMap.push(response.parent.parent.name)
                        myMap.push(response.parent.parent.parent.name)
                        myMap.push(response.parent.parent.parent.parent.name)
                    }
                    if (response.level == 6) {
                        myMap.push(response.name);
                        myMap.push(response.parent.name)
                        myMap.push(response.parent.parent.name)
                        myMap.push(response.parent.parent.parent.name)
                        myMap.push(response.parent.parent.parent.parent.name)
                        myMap.push(response.parent.parent.parent.parent.parent.name)
                    }
                }
            });
            for (var i = myMap.length - 1; i >= 0; i--) {
                $scope.hierarchy += myMap[i] + "/";
            }
            return $scope.hierarchy;
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