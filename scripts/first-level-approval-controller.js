//Controller for the header section
var trackerCapture = angular.module('trackerCapture');
trackerCapture.controller('FirstLevelApprovalController',
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
            $scope.allEvents = [];
            if ((startDate == undefined && endDate == undefined) || (startDate == null && endDate == null) || (startDate == "" && endDate == "")) {
                $.ajax({
                    async: false,
                    type: "GET",
                    url: DHIS2URL + "/events.json?orgUnit=" + $scope.selectedOrgUnit.id + "&ouMode=DESCENDANTS&program=" + selectedProgram.id + "&programStage=" + selectedProgramStage.id + "&skipPaging=true",
                    success: function (response) {
                        response.events.forEach(function (ev) {
                            $scope.allEvents.push(ev);
                        });
                    }
                });
                getEvents($scope.allEvents, selectedProgram, selectedProgramStage);
            }
            else {
                if ((!startDate) || (!endDate)) {
                    window.alert("Please select the dates correctly");
                }
                else if (moment(endDate).isBefore(moment(startDate))) {
                    window.alert('Please select end date Accordingly');
                }
                else {
                    $.ajax({
                        async: false,
                        type: "GET",
                        url: DHIS2URL + "/events.json?orgUnit=" + $scope.selectedOrgUnit.id + "&ouMode=DESCENDANTS&program=" + selectedProgram.id + "&programStage=" + selectedProgramStage.id + "&startDate=" + startDate + "&endDate=" + endDate + "&skipPaging=true",
                        success: function (response) {
                            response.events.forEach(function (ev) {
                                $scope.allEvents.push(ev);
                            });
                        }
                    });
                    getEvents($scope.allEvents, selectedProgram, selectedProgramStage);
                }
            }
        }

        var getEvents = function (allEvents, selectedProgram, selectedProgramStage) {
            $scope.teiList = []; $scope.displayingValues = [];
            allEvents.forEach(function (evDetails) {
                if (evDetails.status === "COMPLETED") {
                    $scope.teiList.push({tei:evDetails.trackedEntityInstance,eventId:evDetails.event});
                }
            });

            $scope.teiList.forEach(function (evData) {
                $.ajax({
                    async: false,
                    type: "GET",
                    url: DHIS2URL + "/trackedEntityInstances/" + evData.tei + ".json?fields=trackedEntityInstance,orgUnit,created,attributes[attribute,displayName,value,code]&ou=" + $scope.selectedOrgUnit.id + "&ouMode=DESCENDANTSprogram=" + selectedProgram.id + "&programStage=" + selectedProgramStage.id + "&skipPaging=true",
                    success: function (response1) {
                        response1.attributes.forEach(function (attr) {
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
                    }
                })
                $scope.showtable = true;
                $scope.displayingValues.push({ tei: evData.tei, eventId: evData.eventId, amrId: $scope.amr_id, patRegNum: $scope.patientRegNum, dob: $scope.dOb });
            });
            console.log($scope.displayingValues);
        }

        $scope.approvalDashboard = function(tei,eventId1,selectedProgram){
            $window.location.assign('../dhis-web-tracker-capture/index.html#/dashboard?tei=' + tei + '&program=' + selectedProgram.id + '&ou=' +$scope.selectedOrgUnit.id);
           
            var event = {
                status: "ACTIVE",
            };
            $.ajax({
                type: "PUT",
                dataType: "json",
                contentType: "application/json",
                data: JSON.stringify(event),
                url: DHIS2URL + '/events/' + eventId1 + '/'+ event.status, event,
                success: function (response) {
                    console.log("Event updated with Active status:" + eventId1);
                },
                error: function (response) {
                    console.log("Event not updated with Active status:" + eventId1);
                }
            });
        }

    });