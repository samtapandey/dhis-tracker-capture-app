/**
 * Created by Wasib
 */
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
        $scope.apprListTable = false;
        $scope.rejctListTable = false;
        $scope.resentListTable = false;
        $scope.checked = false;
        $scope.dataEntryUserName = 'Data Entry User';
        $scope.validdataEntryUser = false;
        $scope.displayAttrHeader = ["Org Unit", "Patient Registration Number", "Date of Birth", "AMR ID", "Approval Status", "Level 2 Reason for Rejection/Re-submission"];

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
            $scope.checkDataEntryUser();
        }

        $scope.checkDataEntryUser = function () {
            AMRCustomService.getSectionName().then(function (selectedSectionName) {
                var trackdata = selectedSectionName;
                if (trackdata.userGroups != undefined) {
                    for (var j = 0; j < trackdata.userGroups.length; j++) {
                        if (trackdata.userGroups[j].name === $scope.dataEntryUserName) {
                            $scope.validdataEntryUser = true;
                        }
                    }
                }
            });
        }

        $scope.loadData = function () {
            $scope.allEvents = [];
            var selectedProgram = { id: "ecIoUziI2Gb" };
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

        $scope.approvedList = function () {
            $scope.showtable = false;
            $scope.apprListTable = true;
            $scope.rejctListTable = false;
            $scope.resentListTable = false;
        }
        $scope.rejectedList = function () {
            $scope.showtable = false;
            $scope.apprListTable = false;
            $scope.rejctListTable = true;
            $scope.resentListTable = false;
        }
        $scope.resentList = function () {
            $scope.showtable = false;
            $scope.apprListTable = false;
            $scope.rejctListTable = false;
            $scope.resentListTable = true;
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
            var selectedProgram, selectedProgramStage, startDate, endDate;
        }

        var getEvents = function (allEvents, selectedProgram) {
            $scope.teiList = []; $scope.apprTeiList = []; $scope.rejctTeiList = []; $scope.resentTeiList = []; $scope.displayingValues = [];
            $scope.apprDisplayingValues = []; $scope.rejctDisplayingValues = []; $scope.resentDisplayingValues = [];      
            $scope.showtable = true; $scope.apprListTable = false; $scope.rejctListTable = false; $scope.resentListTable = false;
            allEvents.forEach(function (evDetails) {
                $scope.eventDV = []; $scope.approveRejectStatus = ''; $scope.approveRejectStatus2;
                evDetails.dataValues.forEach(function (evDV) {
                    if (evDV.dataElement == 'tAyVrNUTVHX') {
                        $scope.approveRejectStatus = evDV.value;
                    }
                    if (evDV.dataElement == 'sXDQT6Yaf77') {
                        $scope.approveRejectStatus2 = evDV.value;
                    }
                });
                if ((evDetails.status === "COMPLETED" && $scope.approveRejectStatus === 'Approved') || (evDetails.status === "ACTIVE" && $scope.approveRejectStatus === 'Approved')) {
                        $scope.teiList.push({ tei: evDetails.trackedEntityInstance, eventId: evDetails.event, ou: evDetails.orgUnit, prgId: evDetails.program, prgStgId: evDetails.programStage, evDV: evDetails.dataValues });   
                }
                if ($scope.approveRejectStatus2 == 'Approved') {
                    $scope.apprTeiList.push({ tei: evDetails.trackedEntityInstance, eventId: evDetails.event, ou: evDetails.orgUnit, prgId: evDetails.program, prgStgId: evDetails.programStage, evDV: evDetails.dataValues });
                }
                if ($scope.approveRejectStatus2 == 'Rejected') {
                    $scope.rejctTeiList.push({ tei: evDetails.trackedEntityInstance, eventId: evDetails.event, ou: evDetails.orgUnit, prgId: evDetails.program, prgStgId: evDetails.programStage, evDV: evDetails.dataValues });
                }
                if ($scope.approveRejectStatus2 == 'Resend') {
                    $scope.resentTeiList.push({ tei: evDetails.trackedEntityInstance, eventId: evDetails.event, ou: evDetails.orgUnit, prgId: evDetails.program, prgStgId: evDetails.programStage, evDV: evDetails.dataValues });
                }
            });

            
                $scope.teiList.forEach(function (evData) {
                    AMRCustomService.getTEIData(evData, selectedProgram).then(function (response) {
                        response.attributes.forEach(function (attr) {
                            if (attr.code == 'patient_registration_number') {
                                $scope.patientRegNum = attr.value;
                            }
                            if (attr.code == 'dob') {
                                $scope.dOb = attr.value;
                            }
                        });
                        evData.evDV.forEach(function (de) {
                            if (de.dataElement == 'tAyVrNUTVHX') {
                                $scope.approveRejectStatus = de.value;
                            }
                            if (de.dataElement == 'NLmLwjdSHMv') {
                                $scope.reasonOfRejection = de.value;
                            }
                            if(de.dataElement == 'lIkk661BLpG'){
                                $scope.amr_id = de.value;
                            }
                        });
                        $scope.displayingValues.push({ tei: evData.tei, eventId: evData.eventId, ouId: evData.ou, prg: evData.prgId, prgStg: evData.prgStgId, path: getPath(evData.ou), amrId: $scope.amr_id, patRegNum: $scope.patientRegNum, dob: $scope.dOb, apprRejStatus: $scope.approveRejectStatus, reasonOfRej: $scope.reasonOfRejection });
                        $scope.amr_id = '', $scope.patientRegNum = '', $scope.dOb = ''; $scope.approveRejectStatus = ''; $scope.reasonOfRejection = '';
                    });
                    $scope.showtable = true;
                });
                console.log($scope.displayingValues);

            //Approved List//
            $scope.apprTeiList.forEach(function (evData) {
                AMRCustomService.getTEIData(evData, selectedProgram).then(function (response) {
                    response.attributes.forEach(function (attr) {
                        if (attr.code == 'patient_registration_number') {
                            $scope.patientRegNum = attr.value;
                        }
                        if (attr.code == 'dob') {
                            $scope.dOb = attr.value;
                        }
                    });
                    evData.evDV.forEach(function (de) {
                        if (de.dataElement == 'sXDQT6Yaf77') {
                            $scope.approveRejectStatus2 = de.value;
                        }
                        if (de.dataElement == 'pz8SoHBO6RL') {
                            $scope.reasonOfRejection = de.value;
                        }
                        if(de.dataElement == 'lIkk661BLpG'){
                            $scope.amr_id = de.value;
                        }
                    });
                    $scope.apprDisplayingValues.push({ tei: evData.tei, eventId: evData.eventId, ouId: evData.ou, prg: evData.prgId, prgStg: evData.prgStgId, path: getPath(evData.ou), amrId: $scope.amr_id, patRegNum: $scope.patientRegNum, dob: $scope.dOb, apprRejStatus: $scope.approveRejectStatus2, reasonOfRej: $scope.reasonOfRejection });
                    $scope.amr_id = '', $scope.patientRegNum = '', $scope.dOb = ''; $scope.approveRejectStatus2 = ''; $scope.reasonOfRejection = '';
                });
            });
            console.log($scope.apprDisplayingValues);

            //Rejected List//
            $scope.rejctTeiList.forEach(function (evData) {
                AMRCustomService.getTEIData(evData, selectedProgram).then(function (response) {
                    response.attributes.forEach(function (attr) {
                        if (attr.code == 'patient_registration_number') {
                            $scope.patientRegNum = attr.value;
                        }
                        if (attr.code == 'dob') {
                            $scope.dOb = attr.value;
                        }
                    });
                    evData.evDV.forEach(function (de) {
                        if (de.dataElement == 'sXDQT6Yaf77') {
                            $scope.approveRejectStatus2 = de.value;
                        }
                        if (de.dataElement == 'pz8SoHBO6RL') {
                            $scope.reasonOfRejection = de.value;
                        }
                        if(de.dataElement == 'lIkk661BLpG'){
                            $scope.amr_id = de.value;
                        }
                    });
                    $scope.rejctDisplayingValues.push({ tei: evData.tei, eventId: evData.eventId, ouId: evData.ou, prg: evData.prgId, prgStg: evData.prgStgId, path: getPath(evData.ou), amrId: $scope.amr_id, patRegNum: $scope.patientRegNum, dob: $scope.dOb, apprRejStatus: $scope.approveRejectStatus2, reasonOfRej: $scope.reasonOfRejection });
                    $scope.amr_id = '', $scope.patientRegNum = '', $scope.dOb = ''; $scope.approveRejectStatus2 = ''; $scope.reasonOfRejection = '';
                });
            });
            console.log($scope.rejctDisplayingValues);

            //Resent List//
            $scope.resentTeiList.forEach(function (evData) {
                AMRCustomService.getTEIData(evData, selectedProgram).then(function (response) {
                    response.attributes.forEach(function (attr) {
                        if (attr.code == 'patient_registration_number') {
                            $scope.patientRegNum = attr.value;
                        }
                        if (attr.code == 'dob') {
                            $scope.dOb = attr.value;
                        }
                    });
                    evData.evDV.forEach(function (de) {
                        if (de.dataElement == 'sXDQT6Yaf77') {
                            $scope.approveRejectStatus2 = de.value;
                        }
                        if (de.dataElement == 'pz8SoHBO6RL') {
                            $scope.reasonOfRejection = de.value;
                        }
                        if(de.dataElement == 'lIkk661BLpG'){
                            $scope.amr_id = de.value;
                        }
                    });
                    $scope.resentDisplayingValues.push({ tei: evData.tei, eventId: evData.eventId, ouId: evData.ou, prg: evData.prgId, prgStg: evData.prgStgId, path: getPath(evData.ou), amrId: $scope.amr_id, patRegNum: $scope.patientRegNum, dob: $scope.dOb, apprRejStatus: $scope.approveRejectStatus2, reasonOfRej: $scope.reasonOfRejection });
                    $scope.amr_id = '', $scope.patientRegNum = '', $scope.dOb = ''; $scope.approveRejectStatus2 = ''; $scope.reasonOfRejection = '';
                });
            });
            console.log($scope.resentDisplayingValues);

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

        $scope.approvalDashboard = function (tei, eventId1, selectedProgram, evprgStage, evOu) {
            $window.location.assign('../dhis-web-tracker-capture/index.html#/dashboard?tei=' + tei + '&program=' + selectedProgram + '&ou=' + evOu + '&ev=' + evprgStage);

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